import { SigningStargateClient } from '@cosmjs/stargate';

export const getAccountInfo = async (client: SigningStargateClient, address: string) => {
    const account = await client.getAccount(address);
    console.log("account:", account)

    const balance = await client.getAllBalances(address);
    console.log("balance:", balance)

    const uosmo_balance = await client.getBalance(address, "uosmo");
    console.log("uosmo_balance:", uosmo_balance)

    const usdt_balance = await client.getBalance(address, "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4");
    console.log("usdt_balance:", usdt_balance)
};