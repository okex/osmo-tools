import { Dec, IntPretty } from '@keplr-wallet/unit';
import { coins, coin } from '@cosmjs/amino';
import { decodeTxRaw, decodePubkey, EncodeObject } from '@cosmjs/proto-signing';
import { SigningStargateClient, DeliverTxResponse } from '@cosmjs/stargate';
import { osmosis, GAS_VALUES } from 'osmojs';
import { SwapAmountInRoute } from 'osmojs/types/proto/osmosis/gamm/v1beta1/tx';
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Long } from "@osmonauts/helpers";


const {
    joinPool,
    exitPool,
    exitSwapExternAmountOut,
    exitSwapShareAmountIn,
    joinSwapExternAmountIn,
    joinSwapShareAmountOut,
    swapExactAmountIn,
    swapExactAmountOut
} = osmosis.gamm.v1beta1.MessageComposer.withTypeUrl;

export const swapExactAmountInMsg = async (
    sender: string,
    poolId: Long,
    amountIn: string,
    denomIn: string,
    denomOut: string,
    minAmountOut: string): Promise<EncodeObject> => {
    const routes: SwapAmountInRoute[] = [{
        poolId,
        tokenOutDenom: denomOut
    }];
    const msg = swapExactAmountIn({
        sender,
        routes,
        tokenIn: coin(amountIn, denomIn),
        tokenOutMinAmount: minAmountOut
    });
    return msg;
};

export const multiSwapExactAmountInMsg = async (
    sender: string,
    amountIn: string,
    denomIn: string,
    routes: SwapAmountInRoute[],
    minAmountOut: string): Promise<EncodeObject> => {
    const msg = swapExactAmountIn({
        sender,
        routes,
        tokenIn: coin(amountIn, denomIn),
        tokenOutMinAmount: minAmountOut
    });
    return msg;
};

export const sendUosmo = async (
    client: SigningStargateClient,
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    memo: string): Promise<DeliverTxResponse> => {
    // const fee1 = GAS_VALUES.osmosis.swapExactAmountIn;
    // console.log("fee1", fee1)
    // const gasEstimated = await client.simulate(senderAddress, msgs, memo);
    const fee = {
        amount: coins(0, 'uosmo'),
        gas: new IntPretty(new Dec(100000).mul(new Dec(1.3)))
            .maxDecimals(0)
            .locale(false)
            .toString()
    };
    return await client.sendTokens(
        senderAddress,
        recipientAddress,
        coins(amount, 'uosmo'),
        fee,
        memo);
};

export const getTx = async (client: SigningStargateClient, txHash: string) => {
    const txData = await client.getTx(txHash);
    console.log("tx:", txData.tx)

    const rawData = decodeTxRaw(txData.tx)
    console.log("rawData:", rawData)

    const pubKey = rawData.authInfo.signerInfos[0].publicKey
    console.log("pubKey:", decodePubkey(pubKey))

    const messages = rawData.body.messages;
    console.log("messages:", messages)
};

export const simulateTx = async (
    client: SigningStargateClient,
    signerAddress: string,
    messages: EncodeObject[],
    memo: string): Promise<number> => {
    return await client.simulate(signerAddress, messages, memo);
}

export const signTx = async (
    client: SigningStargateClient,
    signerAddress: string,
    messages: EncodeObject[],
    memo: string
): Promise<TxRaw> => {
    const gasEstimated = await client.simulate(signerAddress, messages, memo);
    const fee = {
        amount: coins(558, 'uosmo'),
        gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3)))
            .maxDecimals(0)
            .locale(false)
            .toString()
    };
    const txRaw = await client.sign(
        signerAddress,
        messages,
        fee,
        memo);
    return txRaw;
}

export const signAndBroadcast = async (
    client: SigningStargateClient,
    signerAddress: string,
    messages: EncodeObject[],
    memo: string
): Promise<DeliverTxResponse> => {
    const gasEstimated = await client.simulate(signerAddress, messages, memo);
    const fee = {
        amount: coins(0, 'uosmo'),
        gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3)))
            .maxDecimals(0)
            .locale(false)
            .toString()
    };
    return await client.signAndBroadcast(
        signerAddress,
        messages,
        fee,
        memo);
}


