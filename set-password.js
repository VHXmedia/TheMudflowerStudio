// Gebruik: node set-password.js developer|artist <wachtwoord>
const crypto=require('crypto'),fs=require('fs'),path=require('path');
const [role,pw]=process.argv.slice(2);
if(!['developer','artist'].includes(role)||!pw||pw.length<10){console.log('Gebruik: node set-password.js developer|artist <wachtwoord, min. 10 tekens>');process.exit(1)}
const f=path.join(__dirname,'data','users.json');let u={};try{u=JSON.parse(fs.readFileSync(f))}catch{}
const salt=crypto.randomBytes(16);u[role]={salt:salt.toString('hex'),hash:crypto.scryptSync(pw,salt,64).toString('hex')};
fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(u,null,2),{mode:0o600});console.log('Wachtwoord (scrypt-hash) opgeslagen voor',role);
console.log('\nVoor online hosting: maak deze omgevingsvariabele aan (geen wachtwoord, enkel de hash):\nADMIN_'+role.toUpperCase()+'='+u[role].salt+':'+u[role].hash);
