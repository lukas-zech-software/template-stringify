import * as ts from "typescript";
import { SyntaxKind } from "typescript";

export type ParseResult<T> = {
    _: T;
};

export class TsInferfaceParser<T = any> {
    private json: string;
    private typeChecker: ts.TypeChecker;
    private baseInterface: ts.InterfaceDeclaration;

    constructor(private fileName: string) {
        this.json = '{'


        const config: ts.CompilerOptions = {
            noResolve: true,
            target: ts.ScriptTarget.ES5,
        };

        const program = ts.createProgram([this.fileName], config)

        const ast = program.getSourceFile(this.fileName);
        if (ast === undefined) {
            throw new Error('Could not load file ' + fileName)
        }
        this.baseInterface = ast
            .getChildAt(0)
            .getChildren()
            .find((child) => child.kind === ts.SyntaxKind.InterfaceDeclaration) as ts.InterfaceDeclaration
        this.typeChecker = program.getTypeChecker()


    }


    public create(): T {
        ts.forEachChild(this.baseInterface, (childNode) => {
            if (childNode.kind === ts.SyntaxKind.PropertySignature) {
                this.fn2(childNode as ts.PropertySignature)
            }
        });

        this.json += '}';

        this.json = this.json
            .replace(new RegExp(",}", 'g'), "}")
            .replace(new RegExp(",]", 'g'), "]");

        return JSON.parse(this.json)
    }


    private getSampleData(type: string) {
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
                return ''

        }

    }

    private addArray(node: any /*ts.ArrayTypeNode | ts.TupleTypeNode*/, name: string | undefined /*ts.ArrayTypeNode*/) {
        if (name !== undefined) {
            this.json += `"${name}":`;
        }

        this.json += "[";
        if (node.kind === SyntaxKind.ArrayType) {
            if (node.elementType.kind === ts.SyntaxKind.TypeLiteral) {
                this.addObject(node.elementType as ts.TypeLiteralNode)
            }
        }

        if (node.kind === SyntaxKind.TupleType) {
            node.elementTypes.forEach((elementNode: any) => {
                this.fn2(elementNode)
            })
        }

        const type = this.typeChecker.getTypeAtLocation(node.elementType);

        const stringType = this.typeChecker.typeToString(type);
        this.json += this.getSampleData(stringType);
        this.json += `],`
    }

    private addObject(node: ts.TypeLiteralNode, name?: string) {
        if (name !== undefined) {
            this.json += `"${name}":`;
        }

        this.json += "{";
        node.members.forEach((member) => {
            this.fn2(member);
        });
        this.json += `},`
    }

    private fn2(node: any /*ts.TypeElement*/) {

        if (node.type && node.type.kind === ts.SyntaxKind.TypeLiteral) {
            this.addObject(node.type as ts.TypeLiteralNode, (node as any).symbol.escapedName as string)
            return;
        }

        if (node.type && node.type.kind === ts.SyntaxKind.ArrayType) {
            this.addArray(node.type as ts.ArrayTypeNode, (node as any).symbol.escapedName as string)
            return;
        }

        if (node.type && node.type.kind === ts.SyntaxKind.TupleType) {
            this.addArray(node.type as ts.TupleTypeNode, (node as any).symbol.escapedName as string)
            return;
        }

        if (node.kind === ts.SyntaxKind.TypeLiteral) {
            this.addObject(node as ts.TypeLiteralNode, node.name ? node.name.escapedName : undefined)
            return;
        }

        if (node.kind === ts.SyntaxKind.ArrayType) {
            this.addArray(node as ts.ArrayTypeNode, node.name ? node.name.escapedName : undefined)
            return;
        }

        const identifier = node.name as ts.Identifier;

        this.json += `"${identifier.escapedText}":${this.getSampleData(node.type.getText())},`;
    }

}
