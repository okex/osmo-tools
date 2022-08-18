import { chains } from 'chain-registry';
import { Long } from "@osmonauts/helpers";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import * as tools from './tools';
import * as dotenv from "dotenv";
import { SwapAmountInRoute } from 'osmojs/types/proto/osmosis/gamm/v1beta1/tx';

dotenv.config({ path: '.env' });
const mnemonic = process.env.MNEMONIC;
const pk = process.env.PK;
const apikey = process.env.FIGMENT_APIKEY;

async function main() {
    const chain = chains.find(({ chain_name }) => chain_name === 'osmosis');

    //const signer = await tools.getWalletFromMnemonicForChain({ mnemonic, chain });
    const signer = await tools.getWalletFromPkForChain({ pk, chain });
    //console.log("signer:", await signer.getAccounts())

    const rpcEndpoint = "https://rpc.osmosis.zone";
    // const rpcEndpoint = "https://osmosis-1--rpc--full.datahub.figment.io/apikey/" + apikey;
    const client = await tools.getSigningOsmosisClient({ rpcEndpoint, signer });

    //获取账号信息
    const address = "osmo1pek69naq8r6jacval0yk8avmt70qsymp9w9g0j";
    //await tools.getAccountInfo(client, address);
    //console.log("\n")

    //获取Tx信息
    const txHash = "1BB01C47F8ECBC69129B02E04E0CCF7F9527C7B6C45978D9BC92BB1524911975";
    //await tools.getTx(client, txHash);
    //console.log("\n")

    //UOSMO转账
    const senderAddress = "osmo1pek69naq8r6jacval0yk8avmt70qsymp9w9g0j";
    const recipientAddress = "osmo1gzvx4lqjl4n28purw6sq58sfryua02q9ck9dft"
    const amount = 350000;
    const memo = "m1";
    //const sendUosmoResult = await tools.sendUosmo(client, senderAddress, recipientAddress, amount, memo);
    //console.log("\nsendUosmoResult:", sendUosmoResult)

    //单跳交易
    // const sender = "osmo1pek69naq8r6jacval0yk8avmt70qsymp9w9g0j";
    // const poolId = new Long(39);
    // const amountIn = "1500000";
    // const denomIn = "uosmo";
    // const denomOut = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
    // const minAmountOut = "1000";
    // const msg = await tools.swapExactAmountInMsg(sender, poolId, amountIn, denomIn, denomOut, minAmountOut)
    // console.log("\nmsg:", msg)

    //两跳交易
    const sender = "osmo1pek69naq8r6jacval0yk8avmt70qsymp9w9g0j";
    const amountIn = "1500000";
    const denomIn = "uosmo";
    const minAmountOut = "1000";

    const poolId1 = new Long(39);
    const poolId2 = new Long(4);
    const denomOut1 = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
    const denomOut2 = "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4";
    const routes: SwapAmountInRoute[] = [];
    routes.push({
        poolId: poolId1,
        tokenOutDenom: denomOut1
    });
    routes.push({
        poolId: poolId2,
        tokenOutDenom: denomOut2
    });
    const msg = await tools.multiSwapExactAmountInMsg(sender, amountIn, denomIn, routes, minAmountOut)
    console.log("\nmsg:", msg)


    //模拟交易
    let simulateResult = await tools.simulateTx(client, sender, [msg], "m2")
    console.log("\nsimulateResult:", simulateResult)

    //签名并发送交易
    //const result = await tools.signAndBroadcast(client, sender, [msg], "m2")
    //console.log("\nresult:", result)

    let msg2 =
    {
        "typeUrl": "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
        "value": {
            "sender": sender,
            "routes": [
                {
                    "poolId": "722",
                    "tokenOutDenom": "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A"
                }
            ],
            "tokenIn": {
                "denom": "uosmo",
                "amount": "10000"
            },
            "tokenOutMinAmount": "3854154180813018"
        }
    }

    simulateResult = await tools.simulateTx(client, sender, [msg2], "m2")
    console.log("\nsimulateResult:", simulateResult)

    //签名交易
    const txRaw = await tools.signTx(client, sender, [msg2], "m2")
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
