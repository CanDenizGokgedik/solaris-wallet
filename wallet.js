const {
    Connection,
    Keypair,
    PublicKey,
    clusterApiUrl,
    LAMPORTS_PER_SOL
} = require("@solana/web3.js")

const wallet = new Keypair()

const publicKey = new PublicKey(wallet._keypair.publicKey)
const secretKey = wallet._keypair.secretKey

const getWalletBalance = async() => {

    try{
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
        const walletBalance = connection.getBalance(publicKey)
        console.log('Wallet Balance: ' + walletBalance)
    }catch(err){
        console.log(err)
    }
}

const makeAirdrop = async() => {

    try{
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
        const airdropSignature = connection.requestAirdrop(publicKey, 2*LAMPORTS_PER_SOL)
        const latestBlockHash = connection.getLatestBlockhash()
        await connection.confirmTransaction({
            blockhash: latestBlockHash.block,
            lastValidBlockHeight: latestBlockHash.latestValidBlockHeight,
            signature: airdropSignature 
        })
    }catch(err){
        console.log(err)
    }

}

const main = async() => {
    await getWalletBalance()
    await makeAirdrop()
    await getWalletBalance()
}

main()