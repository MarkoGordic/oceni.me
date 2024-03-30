const fs = require('fs');

function generateTestirajSH(test_data, path) {
    let TESTS_FINAL = "(";
    for (let i = 0; i < test_data.length; i++) {
        if(i == test_data.length - 1)
            TESTS_FINAL += test_data[i].name[1] + test_data[i].name[2];
        else
            TESTS_FINAL += test_data[i].name[1] + test_data[i].name[2] + " ";
    }
    TESTS_FINAL += ")";

    fs.readFile('./util/template.sh', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the template file:', err);
            return;
        }

        const outputData = data.replace('<TESTS_PLACEHOLDER>', TESTS_FINAL);

        fs.writeFile(path, outputData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            }
        });
    });
}

module.exports = {
    generateTestirajSH,
};