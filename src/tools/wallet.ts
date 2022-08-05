import { Secp256k1HdWallet } from '@cosmjs/amino';
import { DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import { Slip10RawIndex } from '@cosmjs/crypto';
import { fromHex } from "@cosmjs/encoding";
import { chains } from 'chain-registry';

export function makeHdPath(coinType = 118, account = 0) {
    return [
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(coinType),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.normal(0),
        Slip10RawIndex.normal(account)
    ];
}

export const getWalletFromMnemonicForChain = async ({ mnemonic, chain }): Promise<Secp256k1HdWallet> => {
    try {
        const { bech32_prefix, slip44 } = chain;
        const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
            prefix: bech32_prefix,
            hdPaths: [makeHdPath(slip44, 0)]
        });
        return wallet;
    } catch (e) {
        console.log('bad mnemonic');
    }
};

export const getWalletFromPkForChain = async ({ pk, chain }): Promise<DirectSecp256k1Wallet> => {
    const { bech32_prefix, slip44 } = chain;
    return DirectSecp256k1Wallet.fromKey(fromHex(pk), bech32_prefix)
};
