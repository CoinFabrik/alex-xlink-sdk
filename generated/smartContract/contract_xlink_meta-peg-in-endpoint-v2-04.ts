
import {
defineContract,
tupleT,
optionalT,
uintT,
bufferT,
listT,
traitT,
responseSimpleT,
booleanT,
stringT,
principalT,
noneT
} from "../smartContractHelpers/codegenImport"

export const metaPegInEndpointV204 = defineContract({
"meta-peg-in-endpoint-v2-04": {
  'finalize-peg-in-cross': {
    input: [
      {
        name: 'commit-tx',
        type: tupleT({ 'fee-idx': optionalT(uintT, ), 'output-idx': uintT, tx: bufferT }, )
      },
      {
        name: 'reveal-tx',
        type: tupleT({ 'order-idx': uintT, tx: bufferT }, )
      },
      {
        name: 'reveal-block',
        type: tupleT({ header: bufferT, height: uintT }, )
      },
      {
        name: 'reveal-proof',
        type: tupleT({ hashes: listT(bufferT, ), 'tree-depth': uintT, 'tx-index': uintT }, )
      },
      { name: 'token-trait', type: traitT },
      { name: 'token-out-trait', type: traitT }
    ],
    output: responseSimpleT(booleanT, ),
    mode: 'public'
  },
  'finalize-peg-in-cross-on-index': {
    input: [
      {
        name: 'tx',
        type: tupleT({
          amt: uintT,
          'bitcoin-tx': bufferT,
          decimals: uintT,
          from: bufferT,
          'from-bal': uintT,
          output: uintT,
          tick: stringT,
          to: bufferT,
          'to-bal': uintT
        }, )
      },
      {
        name: 'block',
        type: tupleT({ header: bufferT, height: uintT }, )
      },
      {
        name: 'proof',
        type: tupleT({ hashes: listT(bufferT, ), 'tree-depth': uintT, 'tx-index': uintT }, )
      },
      {
        name: 'signature-packs',
        type: listT(tupleT({ signature: bufferT, signer: principalT, 'tx-hash': bufferT }, ), )
      },
      {
        name: 'reveal-tx',
        type: tupleT({ 'order-idx': uintT, tx: bufferT }, )
      },
      {
        name: 'reveal-block',
        type: tupleT({ header: bufferT, height: uintT }, )
      },
      {
        name: 'reveal-proof',
        type: tupleT({ hashes: listT(bufferT, ), 'tree-depth': uintT, 'tx-index': uintT }, )
      },
      { name: 'fee-idx', type: optionalT(uintT, ) },
      { name: 'token-trait', type: traitT },
      { name: 'token-out-trait', type: traitT }
    ],
    output: responseSimpleT(booleanT, ),
    mode: 'public'
  },
  pause: {
    input: [ { name: 'new-paused', type: booleanT } ],
    output: responseSimpleT(booleanT, ),
    mode: 'public'
  },
  'set-fee-to-address': {
    input: [ { name: 'new-fee-to-address', type: principalT } ],
    output: responseSimpleT(booleanT, ),
    mode: 'public'
  },
  'set-peg-in-fee': {
    input: [ { name: 'fee', type: uintT } ],
    output: responseSimpleT(booleanT, ),
    mode: 'public'
  },
  'transfer-all-to': {
    input: [
      { name: 'new-owner', type: principalT },
      { name: 'token-trait', type: traitT }
    ],
    output: responseSimpleT(booleanT, ),
    mode: 'public'
  },
  'transfer-all-to-many': {
    input: [
      { name: 'new-owner', type: principalT },
      { name: 'token-traits', type: listT(traitT, ) }
    ],
    output: responseSimpleT(listT(responseSimpleT(booleanT, ), ), ),
    mode: 'public'
  },
  'create-order-cross-or-fail': {
    input: [
      {
        name: 'order',
        type: tupleT({
          'chain-id': optionalT(uintT, ),
          from: bufferT,
          to: bufferT,
          token: principalT,
          'token-out': principalT
        }, )
      }
    ],
    output: responseSimpleT(bufferT, ),
    mode: 'readonly'
  },
  'decode-order-cross-from-reveal-tx-or-fail': {
    input: [
      { name: 'tx', type: bufferT },
      { name: 'order-idx', type: uintT }
    ],
    output: responseSimpleT(tupleT({
      'commit-txid': bufferT,
      'order-details': tupleT({
        'chain-id': optionalT(uintT, ),
        from: bufferT,
        to: bufferT,
        token: principalT,
        'token-out': principalT
      }, )
    }, ), ),
    mode: 'readonly'
  },
  'decode-order-cross-or-fail': {
    input: [ { name: 'order-script', type: bufferT } ],
    output: responseSimpleT(tupleT({
      'chain-id': optionalT(uintT, ),
      from: bufferT,
      to: bufferT,
      token: principalT,
      'token-out': principalT
    }, ), ),
    mode: 'readonly'
  },
  'get-fee-to-address': { input: [], output: principalT, mode: 'readonly' },
  'get-pair-details': {
    input: [
      {
        name: 'pair',
        type: tupleT({ 'chain-id': uintT, token: principalT }, )
      }
    ],
    output: optionalT(tupleT({
      approved: booleanT,
      'no-burn': booleanT,
      'peg-in-fee': uintT,
      'peg-in-paused': booleanT,
      'peg-out-fee': uintT,
      'peg-out-gas-fee': uintT,
      'peg-out-paused': booleanT,
      tick: stringT
    }, ), ),
    mode: 'readonly'
  },
  'get-pair-details-many': {
    input: [
      {
        name: 'pairs',
        type: listT(tupleT({ 'chain-id': uintT, token: principalT }, ), )
      }
    ],
    output: listT(optionalT(tupleT({
      approved: booleanT,
      'no-burn': booleanT,
      'peg-in-fee': uintT,
      'peg-in-paused': booleanT,
      'peg-out-fee': uintT,
      'peg-out-gas-fee': uintT,
      'peg-out-paused': booleanT,
      tick: stringT
    }, ), ), ),
    mode: 'readonly'
  },
  'get-pair-details-or-fail': {
    input: [
      {
        name: 'pair',
        type: tupleT({ 'chain-id': uintT, token: principalT }, )
      }
    ],
    output: responseSimpleT(tupleT({
      approved: booleanT,
      'no-burn': booleanT,
      'peg-in-fee': uintT,
      'peg-in-paused': booleanT,
      'peg-out-fee': uintT,
      'peg-out-gas-fee': uintT,
      'peg-out-paused': booleanT,
      tick: stringT
    }, ), ),
    mode: 'readonly'
  },
  'get-peg-in-fee': { input: [], output: uintT, mode: 'readonly' },
  'get-peg-in-sent-or-default': {
    input: [
      { name: 'bitcoin-tx', type: bufferT },
      { name: 'output', type: uintT },
      { name: 'offset', type: uintT }
    ],
    output: booleanT,
    mode: 'readonly'
  },
  'get-tick-to-pair-or-fail': {
    input: [ { name: 'tick', type: stringT } ],
    output: responseSimpleT(tupleT({ 'chain-id': uintT, token: principalT }, ), ),
    mode: 'readonly'
  },
  'is-approved-pair': {
    input: [
      {
        name: 'pair',
        type: tupleT({ 'chain-id': uintT, token: principalT }, )
      }
    ],
    output: booleanT,
    mode: 'readonly'
  },
  'is-dao-or-extension': { input: [], output: responseSimpleT(booleanT, ), mode: 'readonly' },
  'is-paused': { input: [], output: booleanT, mode: 'readonly' },
  'is-peg-in-address-approved': {
    input: [ { name: 'address', type: bufferT } ],
    output: booleanT,
    mode: 'readonly'
  },
  'validate-tx-cross': {
    input: [
      {
        name: 'commit-tx',
        type: tupleT({ 'fee-idx': optionalT(uintT, ), 'output-idx': uintT, tx: bufferT }, )
      },
      {
        name: 'reveal-tx',
        type: tupleT({ 'order-idx': uintT, tx: bufferT }, )
      },
      { name: 'token-out-trait', type: traitT }
    ],
    output: responseSimpleT(tupleT({
      'amt-net': uintT,
      fee: uintT,
      'order-details': tupleT({
        'chain-id': optionalT(uintT, ),
        from: bufferT,
        to: bufferT,
        token: principalT,
        'token-out': principalT
      }, ),
      'pair-details': tupleT({ 'chain-id': uintT, token: principalT }, ),
      'token-details': tupleT({
        approved: booleanT,
        'no-burn': booleanT,
        'peg-in-fee': uintT,
        'peg-in-paused': booleanT,
        'peg-out-fee': uintT,
        'peg-out-gas-fee': uintT,
        'peg-out-paused': booleanT,
        tick: stringT
      }, ),
      'tx-idxed': tupleT({ amt: uintT, from: bufferT, tick: stringT, to: bufferT }, )
    }, ), ),
    mode: 'readonly'
  },
  'fee-to-address': { input: noneT, output: principalT, mode: 'variable' },
  paused: { input: noneT, output: booleanT, mode: 'variable' },
  'peg-in-fee': { input: noneT, output: uintT, mode: 'variable' }
}
} as const)


