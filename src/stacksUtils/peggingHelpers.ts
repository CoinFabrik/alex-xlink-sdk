import { fromCorrespondingStacksToken } from "../evmUtils/peggingHelpers"
import { getEVMTokenContractInfo } from "../evmUtils/xlinkContractHelpers"
import {
  getBRC20SupportedRoutes,
  getRunesSupportedRoutes,
} from "../metaUtils/xlinkContractHelpers"
import { hasAny } from "../utils/arrayHelpers"
import { IsSupportedFn } from "../utils/buildSupportedRoutes"
import { checkNever, isNotNull } from "../utils/typeHelpers"
import {
  _allNoLongerSupportedEVMChains,
  KnownChainId,
  KnownTokenId,
} from "../utils/types/knownIds"

export const isSupportedStacksRoute: IsSupportedFn = async (ctx, route) => {
  const { fromChain, toChain, fromToken, toToken } = route

  if (fromChain === toChain && fromToken === toToken) {
    return false
  }

  if (
    KnownChainId.isEVMChain(fromChain) &&
    _allNoLongerSupportedEVMChains.includes(fromChain)
  ) {
    return false
  }
  if (
    KnownChainId.isEVMChain(toChain) &&
    _allNoLongerSupportedEVMChains.includes(toChain)
  ) {
    return false
  }

  if (
    !KnownChainId.isStacksChain(fromChain) ||
    !KnownTokenId.isStacksToken(fromToken)
  ) {
    return false
  }
  if (!KnownChainId.isKnownChain(toChain)) return false

  if (KnownChainId.isStacksChain(toChain)) {
    return false
  }

  if (KnownChainId.isBitcoinChain(toChain)) {
    return (
      fromToken === KnownTokenId.Stacks.aBTC &&
      toToken === KnownTokenId.Bitcoin.BTC
    )
  }

  if (KnownChainId.isRunesChain(toChain)) {
    const supportedRoutes = await getRunesSupportedRoutes(ctx, toChain)
    if (supportedRoutes == null || !hasAny(supportedRoutes)) return false

    return supportedRoutes.some(
      route => route.stacksToken === fromToken && route.runesToken === toToken,
    )
  }

  if (KnownChainId.isBRC20Chain(toChain)) {
    const supportedRoutes = await getBRC20SupportedRoutes(ctx, toChain)
    if (supportedRoutes == null || !hasAny(supportedRoutes)) return false

    return supportedRoutes.some(
      route => route.stacksToken === fromToken && route.brc20Token === toToken,
    )
  }

  if (KnownChainId.isEVMChain(toChain)) {
    const toEVMTokens = await fromCorrespondingStacksToken(toChain, fromToken)
    if (!hasAny(toEVMTokens)) return false

    const toTokenInfos = (
      await Promise.all(
        toEVMTokens.map(token => getEVMTokenContractInfo(ctx, toChain, token)),
      )
    ).filter(isNotNull)
    if (!hasAny(toTokenInfos)) return false

    return toEVMTokens.includes(toToken as any)
  }

  checkNever(toChain)
  return false
}
