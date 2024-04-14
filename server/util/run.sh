#!/bin/sh

gcc -g -m32 <TASKNO_PLACEHOLDER>.S -o result
compile_exit_code=$?

if [ $compile_exit_code -ne 0 ]; then
    echo "{\"compile\": \"failure\", \"compile_exit_code\": $compile_exit_code, \"output_status\": \"failure\", \"program_output\": \"\", \"expected_output\": \"\", \"program_exit_code\": 0, \"program_exit_status\": \"failure\", \"gdb_exit_code\": 0}" > /output/compile_status<COMPILE_STATUS_TASK_PLACEHOLDER>.json
    exit 0
fi

compile_status="success"

program_output=$(echo "<TASK_INPUT_PLACEHOLDER>" | ./result)
program_exit_code=$?
expected_exit_code=<EXPECTED_EXIT_CODE_PLACEHOLDER>

<TEST_OUTPUT_PLACEHOLDER>
expected_output="$OUTP01"

if [ "$program_output" = "$expected_output" ]; then
    output_status="success"
else
    output_status="failure"
fi

if [ $program_exit_code -eq $expected_exit_code ]; then
    program_exit_status="success"
else
    program_exit_status="failure"
fi

gdb -q -ex "source gdb.py" -ex "step_print_regs" -ex "quit" result
gdb_exit_code=$?

echo "{\"compile\": \"$compile_status\", \"compile_exit_code\": $compile_exit_code, \"output_status\": \"$output_status\", \"program_output\": \"$program_output\", \"expected_output\": \"$expected_output\", \"program_exit_code\": $program_exit_code, \"program_exit_status\": \"$program_exit_status\", \"gdb_exit_code\": $gdb_exit_code}" > /output/compile_status<COMPILE_STATUS_TASK_PLACEHOLDER>.json
