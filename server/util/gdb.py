import gdb
import json

instructions = []

class StepAndPrintRegisters(gdb.Command):
    """Step through the program, instruction by instruction, capturing register states and source code lines, and attempt to dereference registers as strings."""

    def __init__(self):
        super(StepAndPrintRegisters, self).__init__("step_print_regs", gdb.COMMAND_USER)
        self.regs = ["eax", "ebx", "ecx", "edx", "esi", "edi", "esp", "ebp", "eip", "eflags"]

    def invoke(self, arg, from_tty):
        try:
            gdb.execute("break main")
            gdb.execute("run < input.txt", to_string=True)

            while True:
                gdb.execute("stepi", to_string=True)

                instruction = gdb.execute("x/i $pc", to_string=True).strip()
                frame = gdb.selected_frame()
                sal = frame.find_sal()
                source_line = sal.line
                source_file = sal.symtab.filename if sal.symtab else "Unknown file"

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

        except gdb.error as e:
            print(f"An error occurred: {str(e)}. Program may have finished executing or encountered a breakpoint.")
        
        finally:
            output_path = "<OUTPUT_PATH_PLACEHOLDER>"
            with open(output_path, "w") as outfile:
                json.dump(instructions, outfile, indent=4)

StepAndPrintRegisters()
