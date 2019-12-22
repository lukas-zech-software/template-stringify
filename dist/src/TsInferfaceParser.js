"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const typescript_1 = require("typescript");
class TsInferfaceParser {
    constructor(fileName) {
        this.fileName = fileName;
        this.json = '{';
        const config = {
            noResolve: true,
            target: ts.ScriptTarget.ES5,
        };
        const program = ts.createProgram([this.fileName], config);
        const ast = program.getSourceFile(this.fileName);
        this.baseInterface = ast
            .getChildAt(0)
            .getChildren()
            .find((child) => child.kind === ts.SyntaxKind.InterfaceDeclaration);
        this.typeChecker = program.getTypeChecker();
    }
    create() {
        ts.forEachChild(this.baseInterface, (childNode) => {
            if (childNode.kind === ts.SyntaxKind.PropertySignature) {
                this.fn2(childNode);
            }
        });
        this.json += '}';
        this.json = this.json
            .replace(new RegExp(",}", 'g'), "}")
            .replace(new RegExp(",]", 'g'), "]");
        return JSON.parse(this.json);
    }
    getSampleData(type) {
        switch (type) {
            case 'number':
                return 0;
            case 'boolean':
                return true;
            case 'string':
                return '"foo"';
            case 'any':
            default:
                //console.log('Unkown type ' + type);
                return '';
        }
    }
    addArray(node /*ts.ArrayTypeNode | ts.TupleTypeNode*/, name /*ts.ArrayTypeNode*/) {
        if (name !== undefined) {
            this.json += `"${name}":`;
        }
        this.json += "[";
        if (node.kind === typescript_1.SyntaxKind.ArrayType) {
            if (node.elementType.kind === ts.SyntaxKind.TypeLiteral) {
                this.addObject(node.elementType);
            }
        }
        if (node.kind === typescript_1.SyntaxKind.TupleType) {
            node.elementTypes.forEach((elementNode) => {
                this.fn2(elementNode);
            });
        }
        const type = this.typeChecker.getTypeAtLocation(node.elementType);
        const stringType = this.typeChecker.typeToString(type);
        this.json += this.getSampleData(stringType);
        this.json += `],`;
    }
    addObject(node, name) {
        if (name !== undefined) {
            this.json += `"${name}":`;
        }
        this.json += "{";
        node.members.forEach((member) => {
            this.fn2(member);
        });
        this.json += `},`;
    }
    fn2(node /*ts.TypeElement*/) {
        if (node.type && node.type.kind === ts.SyntaxKind.TypeLiteral) {
            this.addObject(node.type, node.symbol.escapedName);
            return;
        }
        if (node.type && node.type.kind === ts.SyntaxKind.ArrayType) {
            this.addArray(node.type, node.symbol.escapedName);
            return;
        }
        if (node.type && node.type.kind === ts.SyntaxKind.TupleType) {
            this.addArray(node.type, node.symbol.escapedName);
            return;
        }
        if (node.kind === ts.SyntaxKind.TypeLiteral) {
            this.addObject(node, node.name ? node.name.escapedName : undefined);
            return;
        }
        if (node.kind === ts.SyntaxKind.ArrayType) {
            this.addArray(node, node.name ? node.name.escapedName : undefined);
            return;
        }
        const identifier = node.name;
        this.json += `"${identifier.escapedText}":${this.getSampleData(node.type.getText())},`;
    }
}
exports.TsInferfaceParser = TsInferfaceParser;
//# sourceMappingURL=TsInferfaceParser.js.map