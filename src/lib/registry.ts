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

export const ACCOUNT_FACTORIES: RegistryEntityType[] = [
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
  {
    name: "Trust Wallet",
    dbName: "trust_wallet",
    color: "#43E0A2",
  },
];

export const CHAINS = [
  { chainId: 1, name: "Ethereum", isTestnet: false, color: "#627EEA" },
  { chainId: 8453, name: "Base", isTestnet: false, color: "#0052FF" },
  { chainId: 42161, name: "Arbitrum One", isTestnet: false, color: "#15AAFF" },
  { chainId: 137, name: "Polygon", isTestnet: false, color: "#8f35d58f" },
  { chainId: 10, name: "Optimism", isTestnet: false, color: "#FF011F" },
  { chainId: 43114, name: "Avalanche", isTestnet: false, color: "#E84142" },
  { chainId: 56, name: "Binance", isTestnet: false, color: "#F3BA2F" },
  { chainId: 59144, name: "Linea", isTestnet: false, color: "#44B9E6" },
  { chainId: 100, name: "Gnosis", isTestnet: false, color: "#04795B" },
  { chainId: 7777777, name: "Degen", isTestnet: false, color: "#8B5BF6" },
  { chainId: 42170, name: "Arbitrum Nova", isTestnet: false, color: "#FFBF98" },
  { chainId: 7560, name: "Cyber Mainnet", isTestnet: false, color: "#FE7F2D" },
  { chainId: 84532, name: "Base Sepolia", isTestnet: true, color: "#6CB9FF" },
  { chainId: 80002, name: "Polygon Amoy", isTestnet: true, color: "#B088FF" },
  {
    chainId: 11155420,
    name: "Optimism Sepolia",
    isTestnet: true,
    color: "#FF8B9A",
  },
  { chainId: 43113, name: "Avalanche Fuji", isTestnet: true, color: "#FFB1B1" },
  {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    isTestnet: true,
    color: "#9FDDFF",
  },
  { chainId: 11155111, name: "Sepolia", isTestnet: true, color: "#9B9B9B" },
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
];

export const BUNDLERS: RegistryEntityType[] = [
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
