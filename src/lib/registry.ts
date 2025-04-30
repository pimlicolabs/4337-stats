export type RegistryEntityType = {
  name: string;
  dbName: string;
  color: string;
};

export type EntityType =
  | "paymaster"
  | "bundler"
  | "account_factory"
  | undefined;

export const ENTRYPOINTS = [
  {
    address: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    version: "0.6",
  },
  {
    address: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    version: "0.7",
  },
];

export const ACCOUNT_FACTORIES: RegistryEntityType[] = [
  {
    name: "Grindery",
    dbName: "grindery",
    color: "#D6FFB7",
  },
  {
    name: "Kernel V2",
    dbName: "zerodev_kernel_v2",
    color: "#18BFE6",
  },
  {
    name: "Kernel V3",
    dbName: "zerodev_kernel_v3",
    color: "#4faec4",
  },
  {
    name: "Alchemy Modular Acccount",
    dbName: "alchemy_modular_account",
    color: "#519AD3",
  },
  {
    name: "Alchemy Light Acccount",
    dbName: "alchemy_light_account",
    color: "#97D7EE",
  },
  { name: "Biconomy", dbName: "biconomy", color: "#FD501C" },
  { name: "Thirdweb", dbName: "thirdweb_default", color: "#8007B8" },
  {
    name: "Kinto Access Registry",
    dbName: "kinto_access_registry",
    color: "#010101",
  },
  {
    // source: https://github.com/opensource-observer/oss-directory/blob/551bf7133f71e82f6a56589caabee078e0a9f231/data/projects/e/eco-association.yaml#L19
    // source: https://github.com/GeneralMagicio/pw-retropgf3-categorize/blob/bacd87500dc810e416051c758f2964d1a9459f74/data/0x982E148216E3Aa6B38f9D901eF578B5c06DD7502.json#L29
    name: "Beam Simple Account",
    dbName: "beam_simple_account",
    color: "#3370FF",
  },
  {
    name: "Thirdweb Managed Account",
    dbName: "thirdweb_managed_account",
    color: "#8007B8",
  },
  { name: "Nani", dbName: "nani", color: "#000" },
  {
    name: "Coinbase Smart Wallet",
    dbName: "coinbase_smart_wallet",
    color: "#0252FF",
  },
  { name: "Circle", dbName: "circle", color: "#3498DB" },
  { name: "Simple Account", dbName: "simpleaccount", color: "#E67E22" },
  { name: "Etherspot", dbName: "etherspot", color: "#2ECC71" },
  { name: "Blocto", dbName: "blocto", color: "#F1C40F" },
  { name: "Banana", dbName: "banana", color: "#E74C3C" },
  { name: "Fun.xyz", dbName: "fun.xyz", color: "#1ABC9C" },
  { name: "Candide", dbName: "candide", color: "#8E44AD" },
  { name: "Polynomial", dbName: "polynomial", color: "#D35400" },
  { name: "Lumx", dbName: "lumx", color: "#8431FE" },
  { name: "Safe", dbName: "safe", color: "#17FF80" },
  { name: "Ambire", dbName: "ambire", color: "#8925FF" },
  { name: "Solady", dbName: "solady", color: "#E99C9D" },
  { name: "Splits", dbName: "splits", color: "#6B6B6B" },
  {
    name: "Trust Wallet",
    dbName: "trust_wallet",
    color: "#43E0A2",
  },
  {
    name: "Biconomy Nexus",
    dbName: "biconomy_nexus",
    color: "#F18C73",
  },
  {
    name: "Unknown",
    dbName: "unknown",
    color: "#4A90E2",
  },
];

function generateColorFromString(str: string): string {
  // Create a consistent hash from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to RGB values with good saturation and lightness
  const h = Math.abs(hash) % 360; // Hue: 0-360
  const s = 65 + (Math.abs(hash) % 15); // Saturation: 65-80%
  const l = 45 + (Math.abs(hash) % 15); // Lightness: 45-60%

  return `hsl(${h}, ${s}%, ${l}%)`;
}

export const APPS = [
  {
    name: "Unknown",
    dbNames: [],
  },
  {
    name: "OpenSocial",
    dbNames: [
      "0x00000066C6C6fCa286F48A7f4E989b7198c26cAf",
      "0x2ca3502B30Eb0a1B576a19478262bf75872Ca88e", // https://bscscan.com/tx/0x0df297f98c88fd3a7eb766775947615dff97f9e2110b90dc24505b9cdde8bf32
    ],
  },
  {
    name: "Yellow",
    dbNames: [
      "0x18e73A5333984549484348A94f4D219f4faB7b81",
      "0x2A8B51821884CF9A7ea1A24C72E46Ff52dCb4F16",
      "0xb5F3a9dD92270f55e55B7Ac7247639953538A261", // staking contract
    ],
  },
  {
    name: "PiggyBox",
    dbNames: ["0x1836084c8D1BF58118F072BaeDDD1523403b1b32"],
  },
  {
    name: "X Digital Real (ERC-20)",
    dbNames: ["0x7e68F6e1AC2777a0ba12672fE1Dd45E995004A83"],
  },
  {
    name: "Grindery (ERC-20)",
    dbNames: [
      "0xe36BD65609c08Cd17b53520293523CF4560533d0", // ERC-20
      "0xcc5fD0Ef8E3824d0FcAF60677eA31d585D966A8f", // FeeAccountantPrimary
      "0x9162273E43DADBBF3deaA6303Bf173ac95aFa7C7",
    ],
  },
  {
    name: "1Inch",
    dbNames: ["0x1111111254EEB25477B68fb85Ed929f73A960582"],
  },
  {
    name: "Paraswap",
    dbNames: ["0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"],
  },
  {
    name: "Safe MultiSend",
    dbNames: ["0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526"],
  },
  {
    name: "Safe MultiSendCallOnly",
    dbNames: ["0x9641d764fc13c8B624c04430C7356C1C7C8102e2"],
  },
  {
    name: "Buckzy USD",
    dbNames: ["0x19e2448C0145fAB104C411f1D9eddf1b05D6A4dD"],
  },
  {
    name: "Somon badge (EIP-1155)",
    dbNames: ["0x3376e0ea6f4d0722c6c5c8534d953a29b05117cb"],
  },
  {
    name: "PiChain Token (ERC-20)",
    dbNames: ["0xD0CF4dE352aC8dccE00bD6B93EE73D3Cb272edC3"],
  },
  {
    name: "Wormfare",
    dbNames: ["0x381AE980c9DA2a15C5f210809e4cA50853A4918d"],
  },
  {
    name: "Phenom Poker",
    dbNames: [
      "0x37AEFbD92631Ed932f1C1ed355fAc8d2a8EC68DC",
      "0xC10e197E783394D08310F5013F05362a64a891C4",
      "0xd841DaCe0EfdD174526daDBaA38f3358144bbe91",
      "0xe789D2724f29D8De7FA00a4e133b9072d6A492D9",
    ],
  },
  {
    name: "Pallet (PTT ERC-20)",
    dbNames: ["0x385f490c56932563bAD469C59dC1B79EC84fBDEc"],
  },
  {
    name: "Pallet (PTT ERC-20)",
    dbNames: ["0x385f490c56932563bAD469C59dC1B79EC84fBDEc"],
  },
  {
    name: "Miracle Play (Sevenline Labs)",
    dbNames: [
      "0x2035944dA8880528E50863E996cdCfaf16d9F1d0",
      "0xB75B001bB9c9244b4fb679aDD8322CD7D65225b2",
      "0x0bb1983F89bc50eCb70063d542b77aA5ab7a93Ce",
      "0xF19B4166FE5D9776525E152A7a01432176Fa0fbD",
      "0xa95636Ed6B9a599d760a6AFf92824E8232Cf038D", // FundableTournamentEscrow
      "0x79940436c6a70bad4eCb6A41F4EBFd4735B767aF", // TokenERC20M (token mintable)
      "0x1fca7e7c9BcE37eCb538Cef7937dc30e9C1650be", //  Managed Account Factory (Thirdweb)
      "0x87d6F8eDECcbCcA766D2880D19b2C3777D322C22", // Miracleplay Token (MPT)
      "0x89147D1Af1755f83806f6D821FcbBfa21F13d405", // ERC-20: Battle Point Token (BPT)
      "0x19337585d1DEFe8De9A955b0090aeaC5A498E3B6", // Avax/OpBNB but deployed from seveline labs deployer
      "0xDcD798913b393bFF606D2a1fBF763BD73F018337", // FundableTournamentEscrow
      "0xCa5799c80Aa723647bE6051A1Ccd19c8658319e6", // OpBNB contract deployed from seveline labs deployer
      "0xFCc3839BB0D1A1cbe90eA967526E91B71376E3Ab",
      "0xf0E2f2a84C898989C66FCa1d5BCe869E9BC85ddf",
      "0x0597b72dD532A78A11C16606CD7525D1277bBC7f",
    ],
  },
  {
    name: "UniversalX RedPacket",
    dbNames: ["0xC5b3d940801e585F2d146656356D3F72d94E52aA"],
  },
  {
    name: "GFAL Token",
    dbNames: ["0x47c454cA6be2f6DEf6f32b638C80F91c9c3c5949"],
  },
  {
    name: "Coinflow",
    dbNames: ["0x31D058B5E02c8B01C749e6844d86Cdd3F2962Cd7"],
  },
  {
    name: "Biconomy V2 Session Key manager",
    dbNames: ["0x000002fbffedd9b33f4e7156f2de8d48945e7489"],
  },
  {
    name: "Super useless token",
    dbNames: ["0x57211299bC356319BA5CA36873eB06896173F8bC"],
  },
  {
    name: "Ownable Executor Module",
    dbNames: ["0x95Df3A0a3e49c3e1bAb41c506A22973A106cF6B0"],
  },
  {
    name: "StoryChain Quests",
    dbNames: ["0xB93ABA5aBc0d60910dF2eb755E150048F9A9E96a"], // https://dappbay.bnbchain.org/detail/storychain-quests
  },
  {
    name: "PiChain Recovery Module",
    dbNames: ["0xb382daf7230b73f71a766c96707cf9ec6316b360"],
  },
  {
    name: "USDT",
    dbNames: ["0xc2132D05D31c914a87C6611C10748AEb04B58e8F"],
  },
  {
    name: "USDC",
    dbNames: ["0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"],
  },
  {
    name: "Mocaverse",
    dbNames: [
      "0x8EB187a55B701F8990539bF219b7921d5D3BdadD", // Realm.id
    ],
  },
  {
    name: "Multicall 3",
    dbNames: ["0xcA11bde05977b3631167028862bE2a173976CA11"],
  },
  {
    name: "Xaya Account",
    dbNames: ["0x8C12253F71091b9582908C8a44F78870Ec6F304F"],
  },
  {
    name: "KGen protocol",
    dbNames: ["0x6c7227CB483250Db69C85245eBBe0C7396147a8E"],
  },
  {
    name: "KGen protocol",
    dbNames: ["0x6c7227CB483250Db69C85245eBBe0C7396147a8E"],
  },
  {
    name: "BSC-USD",
    dbNames: ["0x55d398326f99059fF775485246999027B3197955"],
  },
];

// Add color getter for apps
export const getAppColor = (appName: string) =>
  generateColorFromString(appName);

export const CHAINS = [
  {
    chainId: 1,
    name: "Ethereum",
    isTestnet: false,
    color: "#627EEA",
    slugName: "ethereum",
  },
  {
    chainId: 10,
    name: "Optimism",
    isTestnet: false,
    color: "#FF011F",
    slugName: "optimism",
  },
  {
    chainId: 56,
    name: "Binance Smart Chain",
    isTestnet: false,
    color: "#F3BA2F",
    slugName: "bsc",
  },
  {
    chainId: 137,
    name: "Polygon",
    isTestnet: false,
    color: "#8f35d58f",
    slugName: "polygon",
  },
  {
    chainId: 8453,
    name: "Base",
    isTestnet: false,
    color: "#0052FF",
    slugName: "base",
  },
  {
    chainId: 42161,
    name: "Arbitrum One",
    isTestnet: false,
    color: "#15AAFF",
    slugName: "arbitrum",
  },
  {
    chainId: 43114,
    name: "Avalanche C-Chain",
    isTestnet: false,
    color: "#E84142",
    slugName: "avalanche",
  },
  {
    chainId: 204,
    name: "OpBNB",
    isTestnet: false,
    color: "#F0B90B",
    slugName: "opbnb",
  },
  {
    chainId: 11155111,
    name: "Sepolia",
    isTestnet: true,
    color: "#9B9B9B",
    slugName: "sepolia",
  },
  {
    chainId: 480,
    name: "Worldchain",
    isTestnet: false,
    color: "#3F3F45",
    slugName: "worldchain",
  },
  {
    chainId: 7777777,
    name: "Zora",
    isTestnet: false,
    color: "#3569EC",
    slugName: "zora",
  },
];

export const PAYMASTERS: RegistryEntityType[] = [
  { name: "Pimlico", dbName: "pimlico", color: "#7116AA" },
  { name: "Coinbase", dbName: "coinbase", color: "#0051FF" },
  { name: "Cometh", dbName: "cometh", color: "#4F46E5" },
  { name: "Biconomy", dbName: "biconomy", color: "#FF4E16" },
  { name: "Alchemy", dbName: "alchemy", color: "#22A1F6" },
  { name: "Nani", dbName: "nani", color: "#000" },
  { name: "Ambire", dbName: "ambire", color: "#8925FF" },
  { name: "Particle", dbName: "particle", color: "#E03FD7" },
  { name: "Candide", dbName: "candide", color: "#E70D51" },
  { name: "Etherspot", dbName: "etherspot", color: "#F79D1E" },
  { name: "Stackup", dbName: "stackup", color: "#FF6B6B" },
  { name: "Blocto", dbName: "blocto", color: "#3182F7" },
  { name: "Circle", dbName: "circle", color: "#0DCCAA" },
  { name: "Send", dbName: "send", color: "#3EFC50" },
  { name: "Daimo", dbName: "daimo", color: "#17AC2C" },
  { name: "OpenFort", dbName: "openfort", color: "#FC3C2F" },
  { name: "Pichain", dbName: "pichain", color: "#FF8101" },
  { name: "Notus", dbName: "notus", color: "#FF8101" },
  { name: "Unknown", dbName: "unknown", color: "#94a3b8" },
];

export const BUNDLERS: RegistryEntityType[] = [
  {
    name: "Gelato",
    dbName: "gelato",
    color: "#FF3C57",
  },
  {
    name: "Pimlico",
    dbName: "pimlico",
    color: "#7116AA",
  },
  {
    name: "Coinbase",
    dbName: "coinbase",
    color: "#0051FF",
  },
  {
    name: "Unipass",
    dbName: "unipass",
    color: "#CFD7FF",
  },
  {
    name: "Cometh",
    dbName: "cometh",
    color: "#F9F6EE",
  },
  {
    name: "Biconomy",
    dbName: "biconomy",
    color: "#FF4E16",
  },
  {
    name: "Alchemy",
    dbName: "alchemy",
    color: "#22A1F6",
  },
  {
    name: "Etherspot",
    dbName: "etherspot",
    color: "#F79D1E",
  },
  {
    name: "Candide",
    dbName: "candide",
    color: "#E70D51",
  },
  {
    name: "Particle",
    dbName: "particle",
    color: "#E03FD7",
  },
  {
    name: "Unknown",
    dbName: "unknown",
    color: "#94a3b8",
  },
  {
    name: "Send",
    dbName: "send",
    color: "#3EFC50",
  },
  {
    name: "Thirdweb",
    dbName: 'thirdweb',
    color: '#A60BB1'
  }
];

export const BUNDLER_CHART_CONFIG = BUNDLERS.reduce(
  (acc, bundler) => {
    acc[bundler.name.toLowerCase()] = {
      label: bundler.name,
      color: bundler.color,
    };
    return acc;
  },
  {} as Record<string, { label: React.ReactNode; color?: string }>,
);

// Apps chart config with deterministic colors
export const APPS_CHART_CONFIG = APPS.reduce(
  (acc, app) => {
    acc[app.name] = {
      label: app.name,
      color: getAppColor(app.name),
    };
    return acc;
  },
  {} as Record<string, { label: React.ReactNode; color?: string }>,
);

export const PAYMASTER_CHART_CONFIG = PAYMASTERS.reduce(
  (acc, paymaster) => {
    acc[paymaster.name.toLowerCase()] = {
      label: paymaster.name,
      color: paymaster.color,
    };
    return acc;
  },
  {} as Record<string, { label: React.ReactNode; color?: string }>,
);

export const FACTORY_CHART_CONFIG = ACCOUNT_FACTORIES.reduce(
  (acc, factory) => {
    acc[factory.dbName.toLowerCase()] = {
      label: factory.name,
      color: factory.color,
    };
    return acc;
  },
  {} as Record<string, { label: React.ReactNode; color?: string }>,
);

export const CHAIN_CHART_CONFIG = CHAINS.reduce(
  (acc, chain) => {
    acc[chain.chainId] = {
      label: chain.name,
      color: chain.color,
    };
    return acc;
  },
  {} as Record<string, { label: React.ReactNode; color?: string }>,
);
