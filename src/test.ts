import { chains } from 'chain-registry';
import { Long } from "@osmonauts/helpers";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import * as tools from './tools';
import * as dotenv from "dotenv";

dotenv.config({ path: '.env' });
const mnemonic = process.env.MNEMONIC;
const pk = process.env.PK;
const apikey = process.env.FIGMENT_APIKEY;

async function main() {
    const chain = chains.find(({ chain_name }) => chain_name === 'osmosis');

    //const signer = await tools.getWalletFromMnemonicForChain({ mnemonic, chain });
    const signer = await tools.getWalletFromPkForChain({ pk, chain });
    //console.log("signer:", await signer.getAccounts())

    //const rpcEndpoint = "https://rpc.osmosis.zone";
    const rpcEndpoint = "https://osmosis-1--rpc--full.datahub.figment.io/apikey/" + apikey;
    const client = await tools.getSigningOsmosisClient({ rpcEndpoint, signer });

    //获取账号信息
    const address = "osmo1pek69naq8r6jacval0yk8avmt70qsymp9w9g0j";
    await tools.getAccountInfo(client, address);
    console.log("\n")

    //获取Tx信息
    const txHash = "1BB01C47F8ECBC69129B02E04E0CCF7F9527C7B6C45978D9BC92BB1524911975";
    await tools.getTx(client, txHash);
    console.log("\n")

    //UOSMO转账
    const senderAddress = "osmo1pek69naq8r6jacval0yk8avmt70qsymp9w9g0j";
    const recipientAddress = "osmo1gzvx4lqjl4n28purw6sq58sfryua02q9ck9dft"
    const amount = 350000;
    const memo = "m1";
    //const sendUosmoResult = await tools.sendUosmo(client, senderAddress, recipientAddress, amount, memo);
    //console.log("\nsendUosmoResult:", sendUosmoResult)

    //swapExactAmountIn
    const sender = "osmo1pek69naq8r6jacval0yk8avmt70qsymp9w9g0j";
    const poolId = new Long(39);
    const amountIn = "1500000";
    const denomIn = "uosmo";
    const denomOut = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
    const minAmountOut = "1000";
    const msg = await tools.swapExactAmountInMsg(sender, poolId, amountIn, denomIn, denomOut, minAmountOut)
    console.log("\nmsg:", msg)

    //模拟交易
    const simulateResult = await tools.simulateTx(client, sender, [msg], "m2")
    console.log("\nsimulateResult:", simulateResult)

    //签名并发送交易
    //const result = await tools.signAndBroadcast(client, sender, [msg], "m2")
    //console.log("\nresult:", result)

    //签名交易
    const txRaw = await tools.signTx(client, sender, [msg], "m2")
    console.log("\ntxRaw:", txRaw)

    //发送交易
    //const txBytes = TxRaw.encode(txRaw).finish();
    //const broadcastResult = await client.broadcastTx(txBytes)
    //console.log("\nbroadcastResult:", broadcastResult)
}

main()
    .catch(err => {
        console.error(err);
        process.exit(-1);
    })
    .then(() => process.exit());