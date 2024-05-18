import gdb
import json

instructions = []
MAX_STEPS = 10000 

class StepAndPrintRegisters(gdb.Command):
    """Step through the program, capturing register states and source code lines, focusing on user-defined functions in .c or .S files."""

    def __init__(self):
        super(StepAndPrintRegisters, self).__init__("step_print_regs", gdb.COMMAND_USER)
        self.regs = ["eax", "ebx", "ecx", "edx", "esi", "edi", "esp", "ebp", "eip", "eflags"]

    def invoke(self, arg, from_tty):
        step_count = 0
        try:
            gdb.execute("break main")
            gdb.execute("run < input.txt", to_string=True)

            while step_count < MAX_STEPS:
                gdb.execute("stepi", to_string=True)

                frame = gdb.selected_frame()
                sal = frame.find_sal()

                if not sal.symtab or "/lib32/" in sal.symtab.filename:
                    gdb.execute("finish")
                    continue
                
                source_file = sal.symtab.filename
                file_extension = source_file.split('.')[-1].lower() if source_file else ""

                if file_extension not in ['c', 's']:
                    gdb.execute("finish")
                    continue

                source_line = sal.line
                instruction = gdb.execute("x/i $pc", to_string=True).strip()

                registers = {}
                register_strings = {}
                for reg in self.regs:
                    try:
                        value = gdb.parse_and_eval(f"${reg}")
                        registers[reg] = str(value)

                        string_value = gdb.execute(f"x/s ${reg}", to_string=True)
                        if '\"' in string_value:
                            register_strings[reg] = string_value.split('"')[1]
                        else:
                            register_strings[reg] = "Not a string or invalid pointer"
                    except gdb.error:
                        registers[reg] = "Error or not available"
                        register_strings[reg] = "Error or not dereferenced"

                instructions.append({
                    "instruction": instruction,
                    "registers": registers,
                    "register_strings": register_strings,
                    "source": {
                        "file": source_file,
                        "line": source_line
                    }
                })
                
                step_count += 1

        except gdb.error as e:
            print(f"An error occurred: {str(e)}. Program may have finished executing or encountered a breakpoint.")

        finally:
            output_path = "<OUTPUT_PATH_PLACEHOLDER>"
            with open(output_path, "w") as outfile:
                json.dump(instructions, outfile, indent=4)
            print(f"Execution terminated after {step_count} steps, focusing on .c and .S files.")
            if step_count == MAX_STEPS:
                print(f"Reached maximum step count of {MAX_STEPS}.")
                gdb.execute("quit 99")


StepAndPrintRegisters()
