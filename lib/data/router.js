module.exports = {
    routers: {
        starz: "0x1355A5E85bDE471B9Aa418F869f936446357748B",
        pancake: "0x10ed43c718714eb63d5aa57b78b54704e256024e",
    },

    currencies: [
        {
            tokens: "STL_BSC->BUSD_BSC",
            router: "starz",
        },
        {
            tokens: "BUSD_BSC->STL_BSC",
            router: "starz",
        },

        {
            tokens: "STL_BSC->WBNB",
            router: "starz",
        },
        {
            tokens: "WBNB->STL_BSC",
            router: "starz",
        },
        {
            tokens: "VIO_SYSTEM->BUSD_SYSTEM",
            router: "starz",
        },
        {
            tokens: "BUSD_SYSTEM->VIO_SYSTEM",
            router: "starz",
        },

        {
            tokens: "STYL_BSC->WBNB",
            router: "pancake",
        },
        {
            tokens: "WBNB->STYL_BSC",
            router: "pancake",
        },

        {
            tokens: "BUSD_BSC->WBNB",
            router: "pancake",
        },
        {
            tokens: "WBNB->BUSD_BSC",
            router: "pancake",
        },
    ],
};
