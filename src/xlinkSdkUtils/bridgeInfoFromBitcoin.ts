import { getBtc2StacksFeeInfo } from "../bitcoinUtils/peggingHelpers"
import { getStacks2EvmFeeInfo } from "../evmUtils/peggingHelpers"
import { contractAssignedChainIdFromBridgeChain } from "../stacksUtils/crossContractDataMapping"
import {
  getStacksContractCallInfo,
  getStacksTokenContractInfo,
} from "../stacksUtils/xlinkContractHelpers"
import { UnsupportedBridgeRouteError } from "../utils/errors"
import { composeTransferProphet2 } from "../utils/feeRateHelpers"
import { PublicTransferProphet } from "./types"
import { KnownChainId, KnownTokenId } from "../utils/knownIds"
import { assertExclude, checkNever } from "../utils/typeHelpers"
import { ChainId, SDKNumber, TokenId, toSDKNumberOrUndefined } from "./types"

export interface BridgeInfoFromBitcoinInput {
  fromChain: ChainId
  toChain: ChainId
  amount: SDKNumber
}

export interface BridgeInfoFromBitcoinOutput extends PublicTransferProphet {
  feeToken: TokenId
}

export const bridgeInfoFromBitcoin = async (
  info: BridgeInfoFromBitcoinInput,
): Promise<BridgeInfoFromBitcoinOutput> => {
  const fromChain = info.fromChain
  const toChain = info.toChain

  if (
    !KnownChainId.isKnownChain(fromChain) ||
    !KnownChainId.isKnownChain(toChain)
  ) {
    throw new UnsupportedBridgeRouteError(
      info.fromChain,
      info.toChain,
      KnownTokenId.Bitcoin.BTC,
    )
  }

  if (KnownChainId.isBitcoinChain(fromChain)) {
    if (KnownChainId.isStacksChain(toChain)) {
      return bridgeInfoFromBitcoin_toStacks({
        ...info,
        fromChain: fromChain,
        toChain: toChain,
      })
    }

    if (KnownChainId.isEVMChain(toChain)) {
      return bridgeInfoFromBitcoin_toEVM({
        ...info,
        fromChain: fromChain,
        toChain: toChain,
      })
    }

    assertExclude(toChain, assertExclude.i<KnownChainId.BitcoinChain>())
    checkNever(toChain)
  } else {
    assertExclude(fromChain, assertExclude.i<KnownChainId.StacksChain>())
    assertExclude(fromChain, assertExclude.i<KnownChainId.EVMChain>())
    checkNever(fromChain)
  }

  throw new UnsupportedBridgeRouteError(
    info.fromChain,
    info.toChain,
    KnownTokenId.Bitcoin.BTC,
  )
}

async function bridgeInfoFromBitcoin_toStacks(
  info: Omit<BridgeInfoFromBitcoinInput, "fromChain" | "toChain"> & {
    fromChain: KnownChainId.BitcoinChain
    toChain: KnownChainId.StacksChain
  },
): Promise<BridgeInfoFromBitcoinOutput> {
  const contractCallInfo = getStacksContractCallInfo(info.toChain)
  if (contractCallInfo == null) {
    throw new UnsupportedBridgeRouteError(
      info.fromChain,
      info.toChain,
      KnownTokenId.Bitcoin.BTC,
    )
  }

  const feeInfo = await getBtc2StacksFeeInfo({
    network: contractCallInfo.network,
    endpointDeployerAddress: contractCallInfo.deployerAddress,
  })

  return {
    isPaused: feeInfo.isPaused,
    feeToken: KnownTokenId.Bitcoin.BTC as TokenId,
    feeRate: toSDKNumberOrUndefined(feeInfo.feeRate),
    minFeeAmount: toSDKNumberOrUndefined(feeInfo.minFeeAmount),
    minBridgeAmount: toSDKNumberOrUndefined(feeInfo.minBridgeAmount),
    maxBridgeAmount: toSDKNumberOrUndefined(feeInfo.maxBridgeAmount),
  }
}

async function bridgeInfoFromBitcoin_toEVM(
  info: Omit<BridgeInfoFromBitcoinInput, "fromChain" | "toChain"> & {
    fromChain: KnownChainId.BitcoinChain
    toChain: KnownChainId.EVMChain
  },
): Promise<BridgeInfoFromBitcoinOutput> {
  const transitStacksChainId =
    info.fromChain === KnownChainId.Bitcoin.Mainnet
      ? KnownChainId.Stacks.Mainnet
      : KnownChainId.Stacks.Testnet
  const stacksContractCallInfo = getStacksTokenContractInfo(
    transitStacksChainId,
    KnownTokenId.Stacks.aBTC,
  )
  if (stacksContractCallInfo == null) {
    throw new UnsupportedBridgeRouteError(
      info.fromChain,
      info.toChain,
      KnownTokenId.Bitcoin.BTC,
    )
  }

  const step1FeeInfo = await getBtc2StacksFeeInfo({
    network: stacksContractCallInfo.network,
    endpointDeployerAddress: stacksContractCallInfo.deployerAddress,
  })
  const step2FeeInfo = await getStacks2EvmFeeInfo(
    {
      network: stacksContractCallInfo.network,
      endpointDeployerAddress: stacksContractCallInfo.deployerAddress,
    },
    {
      toChainId: contractAssignedChainIdFromBridgeChain(info.toChain),
      stacksToken: stacksContractCallInfo,
    },
  )
  if (step2FeeInfo == null) {
    throw new UnsupportedBridgeRouteError(
      info.fromChain,
      info.toChain,
      KnownTokenId.Bitcoin.BTC,
    )
  }

  const finalInfo = composeTransferProphet2(step1FeeInfo, step2FeeInfo)

  return {
    isPaused: finalInfo.isPaused,
    feeToken: KnownTokenId.Bitcoin.BTC as TokenId,
    feeRate: toSDKNumberOrUndefined(finalInfo.feeRate),
    minFeeAmount: toSDKNumberOrUndefined(finalInfo.minFeeAmount),
    minBridgeAmount: toSDKNumberOrUndefined(finalInfo.minBridgeAmount),
    maxBridgeAmount: toSDKNumberOrUndefined(finalInfo.maxBridgeAmount),

    // for debugging
    // @ts-ignore
    _transferProphets: finalInfo.transferProphets,
  }
}
