export class Confirm {
    title: string;
    content: string;
    okButton: { text:string, onClick:()=>void } = { text:'OK', onClick: ()=>{}};
    cancelButton: { text:string, onClick:()=>void } = { text:'Cancel', onClick: ()=>{}};

    constructor(title:string, content:string)
    constructor(title:string, content:string, okButton:{ text:string, onClick:()=>void })
    constructor(title:string, content:string, okButton:{ text:string, onClick:()=>void }, cancelButton:{ text:string, onClick:()=>void })
    constructor(title:string, content:string, okButton?:{ text:string, onClick:()=>void }, cancelButton?:{ text:string, onClick:()=>void }) {
        this.title = title;
        this.content = content;
        if(okButton) this.okButton = okButton;
        if(cancelButton) this.cancelButton = cancelButton;
    }
}
