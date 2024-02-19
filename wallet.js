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
const saveWallet = async(wallet) => {
    //fs.writeFile('wallet.json',wallet, (err)=>{console.log(err)});

    fs.readFile('wallet.json', async(err,data)=>{

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
            let walletBalance = await getWalletBalance(wallet._keypair.publicKey);
            let singleData = {
                _keypair: wallet._keypair,
                balance: walletBalance
            };
            allData.push(singleData);

            // The array which including the all wallets data, writing into wallet.json.
            fs.writeFile('wallet.json',JSON.stringify(allData), (err)=>{if(err){console.log(err)}});
        }

        

    });

    
};

const updateBalance = async(wallet)=>{

    //console.log(wallet._keypair);
    fs.readFile('wallet.json', async(err,data)=>{
        if(err){
            console.log(err);
        }else{

            let tempData = {};
            if(data != ''){
                tempData = JSON.parse(data);
            }

            if(tempData[0] != null){
                console.log(tempData[11]._keypair);
                let dataLength = tempData.length;
                console.log("update balance lenght: "+dataLength )
                for(let i=0; i<dataLength; i++){
                    if(wallet._keypair == tempData[i]._keypair){
                        console.log('same wallet');
                    }else{
                        console.log('is not same wallet.')
                    }
                }


            }




        }

        


    });
}


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
        return walletBalance;
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
            console.log("switch case after new wallet")
            const walletData3 =  await JSON.parse(fs.readFileSync('wallet.json', 'utf8'));
            let walletLength = 0;
            if(walletData3[0] != null) {
                walletLength = walletData3.length ;
            }
            console.log("switchcase wallet length:"+walletLength)
            await updateBalance(walletData3[walletLength-1])
            
    }
}

main()