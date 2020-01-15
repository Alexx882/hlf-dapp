const { exec,execSync } = require("child_process");

exec("docker exec cli bash", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    exec("ls", (error,stdout, stderr) => {
        console.log(error,stdout, stderr);
        
    })
   
    console.error(`stdout: ${stdout}`);
});

execSync("docker exec cli bash")
console.log(execSync("ls").toString("utf-8"))
