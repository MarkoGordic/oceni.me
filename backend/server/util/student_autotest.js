const fs = require('fs').promises;
const fsp = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

function generateTestirajSH(test_data, destinationPath, solutionFilePath, currIndex) {
    return new Promise(async (resolve, reject) => {
        let TESTS_FINAL = "(";
        for (let i = 0; i < test_data.length; i++) {
            if(i == test_data.length - 1)
                TESTS_FINAL += test_data[i].name[1] + test_data[i].name[2];
            else
                TESTS_FINAL += test_data[i].name[1] + test_data[i].name[2] + " ";
        }
        TESTS_FINAL += ")";

        let TESTS_INPUTS = "";
        
        for (let i = 0; i < test_data.length; i++) {
            const prefix = i < 9 ? "TEST0" + (i + 1) : "TEST" + (i + 1);
            TESTS_INPUTS += prefix + '=$(cat <<EOL\n';
        
            const lines = test_data[i].content.split('\n');
            for (const line of lines) {
                if (line.startsWith('@')) {
                    const input = line.slice(1);
                    TESTS_INPUTS += input + '\n';
                }
            }

            TESTS_INPUTS += 'EOL\n)\n\n';
        }

        try {
            const data = await fs.readFile('./util/get_results.sh', 'utf8');
            let outputData = data.replace('<TESTS_PLACEHOLDER>', TESTS_FINAL);
            outputData = outputData.replace('<TESTS_INPUTS_PLACEHOLDER>', TESTS_INPUTS);
            const getResultsPath = path.join(destinationPath, 'get_results.sh');
            await fs.writeFile(getResultsPath, outputData);

            // Make get_results.sh executable
            await fs.chmod(getResultsPath, 0o755);

            try {
                await runGetResultsScript(solutionFilePath, destinationPath);
            } catch (error) {
                console.error('Script execution failed:', error);
            }

            let resultsPath = path.join(destinationPath, 'results.json');
            let resultsData = await fsp.readFile(resultsPath, 'utf-8');
            let results = JSON.parse(resultsData);

            let TESTS_INPUTS_OUTPUTS = "";
            for (let i = 0; i < test_data.length; i++) {
                const prefix = i < 9 ? "TEST0" + (i + 1) : "TEST" + (i + 1);
                TESTS_INPUTS_OUTPUTS += prefix + '=$(cat <<EOL\n';
            
                const lines = test_data[i].content.split('\n');
                for (const line of lines) {
                    if (line.startsWith('@')) {
                        const input = line.slice(1);
                        TESTS_INPUTS_OUTPUTS += input + '\n';
                    }
                }
    
                TESTS_INPUTS_OUTPUTS += 'EOL\n)\n\n';

                const prefix2 = i < 9 ? "OUTP0" + (i + 1) : "OUTP" + (i + 1);
                TESTS_INPUTS_OUTPUTS += prefix2 + '=$(cat <<EOL\n';
                TESTS_INPUTS_OUTPUTS += results[i].output + '\n';
                TESTS_INPUTS_OUTPUTS += 'EOL\n)\n\n';
            }

            let EXITS_FINAL = "(";
            for (let i = 0; i < results.length; i++) {
                if(i == results.length - 1)
                    EXITS_FINAL += results[i].code;
                else
                    EXITS_FINAL += results[i].code + " ";
            }
            EXITS_FINAL += ")";

            const templateData = await fs.readFile('./util/template.sh', 'utf8');
            outputData = templateData.replace('<TESTS_PLACEHOLDER>', TESTS_FINAL);
            outputData = outputData.replace('<TESTS_INPUTS_OUTPUTS_PLACEHOLDER>', TESTS_INPUTS_OUTPUTS);
            outputData = outputData.replace('<EXITS_PLACEHOLDER>', EXITS_FINAL);
            const testirajPath = path.join(destinationPath, 'testiraj.sh');
            await fs.writeFile(testirajPath, outputData);

            // Make testiraj.sh executable
            await fs.chmod(testirajPath, 0o755);
            
            resolve();
        } catch (err) {
            console.error('Error in generateTestirajSH:', err);
            reject(err);
        }
    });
}

function runGetResultsScript(solutionFilePath, destinationPath) {
    return new Promise((resolve, reject) => {
        if (!path.isAbsolute(destinationPath)) {
            console.error('Error: destinationPath must be an absolute path.');
            reject(new Error('destinationPath must be an absolute path.'));
            return;
        }

        const outputPath = path.join(destinationPath, 'results.json');

        const scriptProcess = spawn('bash', [
            path.join(destinationPath, 'get_results.sh'),
            solutionFilePath,
            outputPath
        ], {
            cwd: destinationPath,
            stdio: 'inherit'
        });

        scriptProcess.on('error', (error) => {
            console.error(`Error executing get_results.sh: ${error}`);
            reject(error);
        });

        scriptProcess.on('close', (code) => {
            console.log(`get_results.sh exited with code ${code}`);
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(`get_results.sh exited with code ${code}`));
            }
        });
    });
}

module.exports = {
    generateTestirajSH,
};
