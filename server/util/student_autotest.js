const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

function generateTestirajSH(test_data, destinationPath, solutionFilePath) {
    return new Promise(async (resolve, reject) => {
        console.log(test_data);
        
        let TESTS_FINAL = "(";
        for (let i = 0; i < test_data.length; i++) {
            if(i == test_data.length - 1)
                TESTS_FINAL += test_data[i].name[1] + test_data[i].name[2];
            else
                TESTS_FINAL += test_data[i].name[1] + test_data[i].name[2] + " ";
        }
        TESTS_FINAL += ")";

        let TESTS_INPUTS = "";
        let TESTS_INPUTS_OUTPUTS = "";
        
        for (let i = 0; i < test_data.length; i++) {
            const prefix = i < 9 ? "TEST0" + (i + 1) : "TEST" + (i + 1);
            TESTS_INPUTS += prefix + '=$(cat <<EOL\n';
            TESTS_INPUTS_OUTPUTS += prefix + '_OUTPUT=$(cat <<EOL\n';
        
            const lines = test_data[i].content.split('\n');
            for (const line of lines) {
                if (line.startsWith('@')) {
                    const input = line.slice(1);
                    TESTS_INPUTS += input + '\n';
                } else {
                    TESTS_INPUTS_OUTPUTS += line + '\n';
                }
            }

            TESTS_INPUTS += 'EOL\n)\n\n';
            TESTS_INPUTS_OUTPUTS += 'EOL\n)\n\n';
        }

        try {
            const data = await fs.readFile('./util/get_results.sh', 'utf8');
            let outputData = data.replace('<TESTS_PLACEHOLDER>', TESTS_FINAL);
            outputData = outputData.replace('<TESTS_INPUTS_PLACEHOLDER>', TESTS_INPUTS);
            await fs.writeFile(path.join(destinationPath, 'get_results.sh'), outputData);

            try {
                await runGetResultsScript(solutionFilePath, destinationPath);
            } catch (error) {
                console.error('Script execution failed:', error);
            }

            const templateData = await fs.readFile('./util/template.sh', 'utf8');
            outputData = templateData.replace('<TESTS_PLACEHOLDER>', TESTS_FINAL);
            outputData = outputData.replace('<TESTS_INPUTS_OUTPUTS_PLACEHOLDER>', TESTS_INPUTS_OUTPUTS);
            await fs.writeFile(path.join(destinationPath, 'testiraj.sh'), outputData);
            
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

        const wslSolutionPath = path.resolve(solutionFilePath).replace(/\\/g, '/').replace(/^C:/, '/mnt/c');
        const wslDestinationPath = destinationPath.replace(/\\/g, '/').replace(/^C:/, '/mnt/c');
        const wslOutputPath = path.join(wslDestinationPath, 'results.json').replace(/\\/g, '/');

        const scriptProcess = spawn('wsl', [ // TODO: Remove wsl if not running on Windows
            `${wslDestinationPath}/get_results.sh`,
            wslSolutionPath,
            wslOutputPath
        ], {
            cwd: destinationPath,
            stdio: 'inherit',
            shell: true
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