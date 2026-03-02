
export const delay = async (timeInMs: number): Promise<void> => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res();
        }, timeInMs);
    })
}