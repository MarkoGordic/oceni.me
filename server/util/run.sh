#!/bin/bash

RED='\e[01;31m'
GREEN='\e[01;32m'
BLUE='\e[01;34m'
NC='\e[00m'

TESTS=(01)
EXITS=(<EXPECTED_EXIT_CODE_PLACEHOLDER>)
EMPTY="#"
MISSING=0
QUIET=0
KEEP=0
SIG=""
OUT1=/tmp/out1

# input variables
filename="<TASKNO_PLACEHOLDER>.S"

# config variables
error="false"
error_msg=""

compile_status="failure"
compile_output=""

output_status="failure"
program_output=""
program_exit_code=-1
program_expected_code=<EXPECTED_EXIT_CODE_PLACEHOLDER>
program_exit_status="failure"

gdb_exit_code=-1

<TESTS_INPUT_OUTPUT_PLACEHOLDER>

for prg in "expect" "sed" "diff" "grep"; do
    if ! which $prg &>/dev/null; then
        error_msg="Nedostaje program: $prg"
        error_msg=$(echo $error_msg | base64 -w 0)
        echo "{\"compile\": \"$compile_status\", \"compile_output\": \"$compile_output\", \"error_msg\": \"$error_msg\", \"output_status\": \"$output_status\", \"program_output\": \"$program_output\", \"program_exit_code\": $program_exit_code, \"program_expected_code\": $program_expected_code, \"program_exit_status\": \"$program_exit_status\", \"gdb_exit_code\": $gdb_exit_code}" > /output/compile_status<COMPILE_STATUS_TASK_PLACEHOLDER>.json
        exit 1
    fi
done

# Pocetak kompajliranja
if [ $filename != "" ] && [ -f $filename ]; then
    grep ".text" $filename 1>/dev/null 2>/dev/null && (grep ".globl" $filename 1>/dev/null 2>/dev/null || grep ".global" $filename 1>/dev/null 2>/dev/null)
    if [ $? -ne 0 ]; then
        error_msg="GREŠKA: Odabrani fajl nije asemblerski program!"
        error_msg=$(echo $error_msg | base64 -w 0)
        echo "{\"compile\": \"$compile_status\", \"compile_output\": \"$compile_output\", \"error_msg\": \"$error_msg\", \"output_status\": \"$output_status\", \"program_output\": \"$program_output\", \"program_exit_code\": $program_exit_code, \"program_expected_code\": $program_expected_code, \"program_exit_status\": \"$program_exit_status\", \"gdb_exit_code\": $gdb_exit_code}" > /output/compile_status<COMPILE_STATUS_TASK_PLACEHOLDER>.json
        exit 1
    fi

    GLAVNI=""
    
    if [ $(grep -c "main:" $filename) == "0" ]; then
        if [ -f glavni.c ]; then
            GLAVNI=glavni.c
        fi
    fi

    gcc -g -m32 -o zad $GLAVNI $filename 1>$OUT1 2>&1

    compile_output=$(echo "$compile_output" | base64 -w 0)

    if [ ! -f zad ]; then
        error_msg="Greška u kompajliranju ili izvršna datoteka nije kreirana!"
        error_msg=$(echo $error_msg | base64 -w 0)
        echo "{\"compile\": \"failure\", \"compile_output\": \"$compile_output\", \"error_msg\": \"$error_msg\", \"output_status\": \"failure\", \"program_output\": \"\", \"program_exit_code\": 0, \"program_expected_code\": 0, \"program_exit_status\": \"failure\", \"gdb_exit_code\": 0}" > /output/compile_status<COMPILE_STATUS_TASK_PLACEHOLDER>.json
        rm -f $OUT1
        exit 1
    fi
    
    if [ $? -ne 0 ]; then
        error_msg="Greška u kompajliranju!"
        error_msg=$(echo $error_msg | base64 -w 0)
        echo "{\"compile\": \"$compile_status\", \"compile_output\": \"$compile_output\", \"error_msg\": \"$error_msg\", \"output_status\": \"$output_status\", \"program_output\": \"$program_output\", \"program_exit_code\": $program_exit_code, \"program_expected_code\": $program_expected_code, \"program_exit_status\": \"$program_exit_status\", \"gdb_exit_code\": $gdb_exit_code}" > /output/compile_status<COMPILE_STATUS_TASK_PLACEHOLDER>.json
        rm -f $OUT1
        exit 1
    fi
else
    if [ $filename != "" ]; then
        error_msg="Fajl '$filename' nije nađen!"
        error_msg=$(echo $error_msg | base64 -w 0)
    fi

    echo "{\"compile\": \"$compile_status\", \"compile_output\": \"$compile_output\", \"error_msg\": \"$error_msg\", \"output_status\": \"$output_status\", \"program_output\": \"$program_output\", \"program_exit_code\": $program_exit_code, \"program_expected_code\": $program_expected_code, \"program_exit_status\": \"$program_exit_status\", \"gdb_exit_code\": $gdb_exit_code}" > /output/compile_status<COMPILE_STATUS_TASK_PLACEHOLDER>.json
    exit 2
fi

compile_status="success"

echo "TESTIRAM PRE GDB"
echo $filename

# pokrecemo gdb pre provera, u slucaju da bude fork bomba ili prekoracenje resursa, da dobijemo sav izlaz to tog trenutka
gdb -q -ex "source gdb.py" -ex "step_print_regs" -ex "quit" zad
gdb_exit_code=$?

if [ $gdb_exit_code -eq 99 ]; then
    error_msg="Prekoračen je maksimalan broj instrukcija tokom izvršavanja!"
    error_msg=$(echo $error_msg | base64 -w 0)
    echo "{\"compile\": \"$compile_status\", \"compile_output\": \"$compile_output\", \"error_msg\": \"$error_msg\", \"output_status\": \"$output_status\", \"program_output\": \"$program_output\", \"program_exit_code\": $program_exit_code, \"program_expected_code\": $program_expected_code, \"program_exit_status\": \"$program_exit_status\", \"gdb_exit_code\": $gdb_exit_code}" > /output/compile_status<COMPILE_STATUS_TASK_PLACEHOLDER>.json
    exit 1
fi

echo "TESTIRAM POSLE GDB"

cat >./run <<EOL
spawn -noecho [lindex \$argv 0]
for {set i 1} {\$i < [llength \$argv]} {incr i 1} {
    sleep 0.5
    send -- "[lindex \$argv \$i]"
    send "\r"
}
expect eof
catch wait reason
set sig [lindex \$reason 5]
if {\$sig == ""} {
    set code [lindex \$reason 3]
} elseif {\$sig == "SIGFPE"} {
    set code [expr 128+8]
} elseif {\$sig == "SIGSEGV"} {
    set code [expr 128+11]
} elseif {\$sig == "SIGINT"} {
    set code [expr 128+2]
} elseif {\$sig == "SIGILL"} {
    set code [expr 128+4]
} elseif {\$sig == "SIGKILL"} {
    set code [expr 128+9]
} else {
    set code [expr 128+1]
}
exit \$code
EOL

passed=0
total=0
nn=0
for n in "${TESTS[@]}"; do
    tcode=${EXITS[$nn]}
    cor="OUTP$n"
    eval cor="\$$cor"
    echo -e "$cor" > out2

    # izlazni kod progrma
    program_exit_code=$tcode
    
    tst="TEST$n"
    eval tst=\$$tst
    oldIFS="$IFS"; IFS=$'\n'
    tst=($tst)
    IFS="$oldIFS"
    lin=${#tst[*]}

    for ((l=0; l<lin; l++ )); do
        if [ "${tst[$l]}" == "$EMPTY" ]; then
            eval tst[$l]=""
        fi
    done

    ok=1
    expect run ./zad "${tst[@]}" 1>$OUT1 2>&1
    code=$?
    sed -i -e '$a\' $OUT1
    sed -i 's/\x0//g' $OUT1
    sed -i 's/\xd//g' $OUT1
    sed -i 's/\x0//g' $OUT1
    for ((i=1; i<32; i++)); do
        if [ $i -ne 9 ] && [ $i -ne 10 ] && [ $i -ne 13 ]; then
            hex=$(printf '%X' $i)
            sed -i "s/\x$hex/[0x$hex]/g" $OUT1
        fi
    done

    for ((i=128; i<256; i++)); do
        hex=$(printf '%X' $i)
        sed -i "s/\x$hex/[0x$hex]/g" $OUT1
    done

    echo "RADIM DIFF"

    # OUT2 sadrzi expected output
    diff -q -a -w -B $OUT1 out2 1>/dev/null 2>/dev/null

    echo "DIFF ZAVRSEN"
    echo "DIFF CODE: $?"
    echo "Izlaz programa: $(cat $OUT1)"
    echo "Ocekivani izlaz: $cor"

    if [ $? -eq 0 ]; then
        # outputs are same
        program_output=$(echo "$OUT1" | base64)

        output_status="success"
    else
        # exits are different
        output_status="failure"
        ok=0
    fi

    if [ $code -gt 127 ]; then
        code=$((code-128))
        sig=""
        if [ $code -eq 8 ]; then sig=" (SIGFPE - Floating point exception)"; fi
        if [ $code -eq 11 ]; then sig=" (SIGSEGV - Invalid memory segment access)"; fi
        error_msg="Program je vratio Fatal error signal $code$sig!"
        error_msg=$(echo $error_msg | base64 -w 0)
        ok=0
        SIG="(zbog \e[01;31mexception\e[00m-a) "
    elif [ $code -eq $tcode ]; then
        # exit codes are same
        program_exit_code=$code
        program_exit_status="success"
    else
        # exit codes are different
        program_exit_code=$code
        program_exit_status="failure"
        ok=0
    fi

    total=$((total + 1))

    if [ $ok -eq 1 ]; then
        passed=$((passed + 1))
    fi

    nn=$((nn+1))
done

if [ $KEEP -eq 0 ]; then
    rm -f zad run $OUT1 out2 1>/dev/null 2>/dev/null
else
    rm -f run 1>/dev/null 2>/dev/null
fi

compile_output=$(echo "$compile_output" | base64 -w 0)
echo "{\"compile\": \"$compile_status\", \"compile_output\": \"$compile_output\", \"error_msg\": \"$error_msg\", \"output_status\": \"$output_status\", \"program_output\": \"$program_output\", \"program_exit_code\": $program_exit_code, \"program_expected_code\": $program_expected_code, \"program_exit_status\": \"$program_exit_status\", \"gdb_exit_code\": $gdb_exit_code}" > /output/compile_status<COMPILE_STATUS_TASK_PLACEHOLDER>.json

exit 0