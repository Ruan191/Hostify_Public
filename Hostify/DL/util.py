from random import uniform

def generateCode(length):
    code = ""
    for i in range(length):
        code += chr(int(uniform(48, 119)))

    return code