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
    //fs.writeFile('wallet.json',wallet, (err)=>{console.log(err)});

    fs.readFile('wallet.json', (err,data)=>{

        if(err){
            console.log(err);
        }else{

            let allData = [];
            let tempData = {};
            
            // Checking for empty JSON file 
            if(data != ''){
                // If JSON file is filled, the data will parse.
                tempData  = JSON.parse(data);
            }
            
         
            // Checking the JSON data include a single wallet or wallets array.
            if(tempData[0] != null){
                const dataLength = tempData.length;
                console.log(dataLength)
                // All wallets are pushing to the array.
                for(let i=0; i<dataLength;i++){
                    allData.push(tempData[i]);
                }
            }else{
                // If JSON file include a single wallet,
                // Checing the data is a eligible wallet format, 
                // A eligible single wallet is pushing to the array.
                if(tempData._keypair != null){
                    allData.push(tempData)
                }
            }
            // The last created wallet is pushing to the array.
            allData.push(wallet);

            // The array which including the all wallets data, writing into wallet.json.
            fs.writeFile('wallet.json',JSON.stringify(allData), (err)=>{if(err){console.log(err)}});
        }

        

    });

    
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
            await makeAirdrop(walletData1[0]._keypair.publicKey);
            break;
        case 'balance':
            const walletData = JSON.parse(fs.readFileSync('wallet.json', 'utf8'));
            await getWalletBalance(walletData[0]._keypair.publicKey);
            break;
        default:
            await newWallet();
            
    }
    

    //await getWalletBalance()
    //await makeAirdrop()
    //await getWalletBalance()
}

main()