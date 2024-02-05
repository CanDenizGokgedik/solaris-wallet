const {
    Connection,
    Keypair,
    PublicKey,
    clusterApiUrl,
    LAMPORTS_PER_SOL
} = require("@solana/web3.js")
const fs = require('fs')
const readline = require('readline')


// Saving the Keypair to wallet.json.
const saveWallet = (wallet) => {
    fs.writeFileSync('wallet.json', JSON.stringify(wallet));
};

// New Wallet is creating.
const newWallet = () => {
const wallet = new Keypair();
saveWallet(wallet)
const publicKey = new PublicKey(wallet._keypair.publicKey)
const secretKey = wallet._keypair.secretKey
console.log('The new wallet has been created.')
}





const getWalletBalance = async(publicKeyString) => {

    try{
        const publicKeyBytes = Object.values(publicKeyString).map(val => val);
        const publicKey = new PublicKey(new Uint8Array(publicKeyBytes));
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
        const walletBalance = await connection.getBalance(publicKey)
        console.log('Wallet Balance: ' + walletBalance)
    }catch(err){
        console.log(err)
    }
}

const makeAirdrop = async(publicKeyString) => {

    try{
        const publicKeyBytes = Object.values(publicKeyString).map(val => val);
        const publicKey = new PublicKey(new Uint8Array(publicKeyBytes));
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
        const fromAirDropSignature = await connection.requestAirdrop(publicKey,1 * LAMPORTS_PER_SOL);
        const latestBlockHash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: fromAirDropSignature,
        });
        console.log('The airdrop has been made.')
    }catch(err){
        console.log(err)
    }

}

const main = async() => {

    const args = process.argv.slice(2);
    switch (args[0]) {
        case 'new':
            await newWallet();
            break;
        case 'airdrop':
            const walletData1 = JSON.parse(fs.readFileSync('wallet.json', 'utf8'));
            await makeAirdrop(walletData1._keypair.publicKey);
            break;
        case 'balance':
            const walletData = JSON.parse(fs.readFileSync('wallet.json', 'utf8'));
            await getWalletBalance(walletData._keypair.publicKey);
            break;
        default:
            await newWallet();
            
    }
    

    //await getWalletBalance()
    //await makeAirdrop()
    //await getWalletBalance()
}

main()