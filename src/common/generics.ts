// ES module
export function strictJSONParse<T>(json: string): T | null{
    try {
        return JSON.parse(json) as T;
    }
    catch(e) {
        console.log(e);
        return null;
    }
}