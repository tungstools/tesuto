
function rawToData(raw: string, mime: string = "text/javascript") {
    return `data:${mime};base64,${Buffer.from(raw).toString("base64")}`;
}

export { rawToData }