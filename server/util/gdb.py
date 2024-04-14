import gdb
import json

instructions = []

class StepAndPrintRegisters(gdb.Command):
    """Step through the program, instruction by instruction, capturing register states."""

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
                registers = {}
                
                for reg in self.regs:
                    try:
                        registers[reg] = str(gdb.parse_and_eval(f"${reg}"))
                    except gdb.error:
                        registers[reg] = "Error or not available"
                
                instructions.append({"instruction": instruction, "registers": registers})

        except gdb.error as e:
            print(f"An error occurred: {str(e)}. Program may have finished executing or encountered a breakpoint.")
        
        finally:
            with open("<OUTPUT_PATH_PLACEHOLDER>", "w") as outfile:
                json.dump(instructions, outfile, indent=4)

StepAndPrintRegisters()