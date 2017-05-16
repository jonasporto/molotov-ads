export module Util {
    export function valueFor(attr : any) {
        if (attr instanceof Function) return attr();
        return attr;
    }
}
