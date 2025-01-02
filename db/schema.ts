import {
  pgTable,
  index,
  text,
  numeric,
  timestamp,
  integer,
  boolean,
  varchar,
  serial,
  primaryKey,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const contractType = pgEnum("contract_type", [
  "EntryPointV06",
  "EntryPointV07",
]);
export const entityType = pgEnum("entity_type", [
  "EntryPoint_AccountDeployed",
  "EntryPoint_UserOperationEvent",
]);

export const entryPointAccountDeployed = pgTable(
  "EntryPoint_AccountDeployed",
  {
    blockHash: text("blockHash").notNull(),
    blockNumber: numeric("blockNumber").notNull(),
    blockTimestamp: timestamp("blockTimestamp", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    chainId: integer("chainId").notNull(),
    factory: text("factory").notNull(),
    id: text("id").primaryKey().notNull(),
    paymaster: text("paymaster").notNull(),
    sender: text("sender").notNull(),
    transactionHash: text("transactionHash").notNull(),
    dbWriteTimestamp: timestamp("db_write_timestamp", {
      mode: "date",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      blockTimestamp: index("EntryPoint_AccountDeployed_blockTimestamp").using(
        "btree",
        table.blockTimestamp.asc().nullsLast(),
      ),
      chainId: index("EntryPoint_AccountDeployed_chainId").using(
        "btree",
        table.chainId.asc().nullsLast(),
      ),
      factory: index("EntryPoint_AccountDeployed_factory").using(
        "btree",
        table.factory.asc().nullsLast(),
      ),
      paymaster: index("EntryPoint_AccountDeployed_paymaster").using(
        "btree",
        table.paymaster.asc().nullsLast(),
      ),
      transactionHash: index(
        "EntryPoint_AccountDeployed_transactionHash",
      ).using("btree", table.transactionHash.asc().nullsLast()),
      idxAccountdeployedSenderChainid: index(
        "idx_accountdeployed_sender_chainid",
      ).using(
        "btree",
        table.sender.asc().nullsLast(),
        table.chainId.asc().nullsLast(),
        table.factory.asc().nullsLast(),
      ),
    };
  },
);

export const entryPointUserOperationEvent = pgTable(
  "EntryPoint_UserOperationEvent",
  {
    actualGasCost: numeric("actualGasCost").notNull(),
    actualGasUsed: numeric("actualGasUsed").notNull(),
    blockHash: text("blockHash").notNull(),
    blockNumber: numeric("blockNumber").notNull(),
    blockTimestamp: timestamp("blockTimestamp", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    chainId: integer("chainId").notNull(),
    entryPoint: text("entryPoint").notNull(),
    id: text("id").primaryKey().notNull(),
    logIndex: integer("logIndex").notNull(),
    nonce: numeric("nonce").notNull(),
    paymaster: text("paymaster").notNull(),
    sender: text("sender").notNull(),
    success: boolean("success").notNull(),
    transactionFrom: text("transactionFrom").notNull(),
    transactionHash: text("transactionHash").notNull(),
    transactionIndex: integer("transactionIndex").notNull(),
    dbWriteTimestamp: timestamp("db_write_timestamp", {
      mode: "date",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      blockTimestamp: index(
        "EntryPoint_UserOperationEvent_blockTimestamp",
      ).using("btree", table.blockTimestamp.asc().nullsLast()),
      chainId: index("EntryPoint_UserOperationEvent_chainId").using(
        "btree",
        table.chainId.asc().nullsLast(),
      ),
      entryPoint: index("EntryPoint_UserOperationEvent_entryPoint").using(
        "btree",
        table.entryPoint.asc().nullsLast(),
      ),
      paymaster: index("EntryPoint_UserOperationEvent_paymaster").using(
        "btree",
        table.paymaster.asc().nullsLast(),
      ),
      sender: index("EntryPoint_UserOperationEvent_sender").using(
        "btree",
        table.sender.asc().nullsLast(),
      ),
      success: index("EntryPoint_UserOperationEvent_success").using(
        "btree",
        table.success.asc().nullsLast(),
      ),
      transactionFrom: index(
        "EntryPoint_UserOperationEvent_transactionFrom",
      ).using("btree", table.transactionFrom.asc().nullsLast()),
      transactionHash: index(
        "EntryPoint_UserOperationEvent_transactionHash",
      ).using("btree", table.transactionHash.asc().nullsLast()),
      idxEupBlocktimestamp: index("idx_eup_blocktimestamp").using(
        "btree",
        table.blockTimestamp.asc().nullsLast(),
      ),
      idxEupTransactionfromChainid: index(
        "idx_eup_transactionfrom_chainid",
      ).using(
        "btree",
        table.transactionFrom.asc().nullsLast(),
        table.chainId.asc().nullsLast(),
      ),
    };
  },
);

export const aggregateTracking = pgTable("aggregate_tracking", {
  aggregateName: varchar("aggregate_name", { length: 100 })
    .primaryKey()
    .notNull(),
  lastProcessedTimestamp: timestamp("last_processed_timestamp", {
    withTimezone: true,
    mode: "date",
  })
    .default(new Date("2023-01-01T00:00:00.000Z"))
    .notNull(),
});

export const bundlers = pgTable("bundlers", {
  name: varchar("name", { length: 50 }).notNull(),
  address: varchar("address", { length: 42 }).primaryKey().notNull(),
});

export const chainMetadata = pgTable("chain_metadata", {
  chainId: integer("chain_id").primaryKey().notNull(),
  startBlock: integer("start_block").notNull(),
  endBlock: integer("end_block"),
  blockHeight: integer("block_height").notNull(),
  firstEventBlockNumber: integer("first_event_block_number"),
  latestProcessedBlock: integer("latest_processed_block"),
  numEventsProcessed: integer("num_events_processed"),
  isHyperSync: boolean("is_hyper_sync").notNull(),
  numBatchesFetched: integer("num_batches_fetched").notNull(),
  latestFetchedBlockNumber: integer("latest_fetched_block_number").notNull(),
  timestampCaughtUpToHeadOrEndblock: timestamp(
    "timestamp_caught_up_to_head_or_endblock",
    { withTimezone: true, mode: "date" },
  ),
});

export const eventSyncState = pgTable("event_sync_state", {
  chainId: integer("chain_id").primaryKey().notNull(),
  blockNumber: integer("block_number").notNull(),
  logIndex: integer("log_index").notNull(),
  blockTimestamp: integer("block_timestamp").notNull(),
  isPreRegisteringDynamicContracts: boolean(
    "is_pre_registering_dynamic_contracts",
  ).notNull(),
});

export const factories = pgTable("factories", {
  name: varchar("name", { length: 50 }).notNull(),
  address: varchar("address", { length: 42 }).primaryKey().notNull(),
});

export const paymasters = pgTable("paymasters", {
  name: varchar("name", { length: 50 }).notNull(),
  address: varchar("address", { length: 42 }).primaryKey().notNull(),
  type: varchar("type").notNull(),
});

export const persistedState = pgTable("persisted_state", {
  id: serial("id").primaryKey().notNull(),
  envioVersion: text("envio_version").notNull(),
  configHash: text("config_hash").notNull(),
  schemaHash: text("schema_hash").notNull(),
  handlerFilesHash: text("handler_files_hash").notNull(),
  abiFilesHash: text("abi_files_hash").notNull(),
});

export const activeAccountsDailyMetrics = pgTable(
  "active_accounts_daily_metrics",
  {
    date: date("date").notNull(),
    chainId: integer("chain_id").notNull(),
    uniqueActiveSenders: integer("unique_active_senders").notNull(),
  },
  (table) => {
    return {
      activeAccountsDailyMetricsPkey: primaryKey({
        columns: [table.date, table.chainId],
        name: "active_accounts_daily_metrics_pkey",
      }),
    };
  },
);

export const activeAccountsMonthlyMetrics = pgTable(
  "active_accounts_monthly_metrics",
  {
    month: date("month").notNull(),
    chainId: integer("chain_id").notNull(),
    uniqueActiveSenders: integer("unique_active_senders").notNull(),
  },
  (table) => {
    return {
      activeAccountsMonthlyMetricsPkey: primaryKey({
        columns: [table.month, table.chainId],
        name: "active_accounts_monthly_metrics_pkey",
      }),
    };
  },
);

export const endOfBlockRangeScannedData = pgTable(
  "end_of_block_range_scanned_data",
  {
    chainId: integer("chain_id").notNull(),
    blockTimestamp: integer("block_timestamp").notNull(),
    blockNumber: integer("block_number").notNull(),
    blockHash: text("block_hash").notNull(),
  },
  (table) => {
    return {
      endOfBlockRangeScannedDataPkey: primaryKey({
        columns: [table.chainId, table.blockNumber],
        name: "end_of_block_range_scanned_data_pkey",
      }),
    };
  },
);

export const factoryHourlyMetrics = pgTable(
  "factory_hourly_metrics",
  {
    hour: timestamp("hour", { withTimezone: true, mode: "date" }).notNull(),
    factoryAddress: varchar("factory_address").notNull(),
    chainId: integer("chain_id").notNull(),
    totalAccountsDeployed: numeric("total_accounts_deployed").notNull(),
  },
  (table) => {
    return {
      factoryHourlyMetricsPkey: primaryKey({
        columns: [table.hour, table.factoryAddress, table.chainId],
        name: "factory_hourly_metrics_pkey",
      }),
    };
  },
);

export const bundlerHourlyMetrics = pgTable(
  "bundler_hourly_metrics",
  {
    hour: timestamp("hour", { withTimezone: true, mode: "date" }).notNull(),
    bundlerName: varchar("bundler_name").notNull(),
    chainId: integer("chain_id").notNull(),
    totalOperationCount: integer("total_operation_count").notNull(),
    totalActualGasCost: numeric("total_actual_gas_cost").notNull(),
  },
  (table) => {
    return {
      bundlerHourlyMetricsPkey: primaryKey({
        columns: [table.hour, table.bundlerName, table.chainId],
        name: "bundler_hourly_metrics_pkey",
      }),
    };
  },
);

export const paymasterHourlyMetrics = pgTable(
  "paymaster_hourly_metrics",
  {
    hour: timestamp("hour", { withTimezone: true, mode: "date" }).notNull(),
    paymasterName: varchar("paymaster_name").notNull(),
    chainId: integer("chain_id").notNull(),
    totalSponsoredOperationCount: integer(
      "total_sponsored_operation_count",
    ).notNull(),
    totalActualGasCost: numeric("total_actual_gas_cost").notNull(),
  },
  (table) => {
    return {
      paymasterHourlyMetricsPkey: primaryKey({
        columns: [table.hour, table.paymasterName, table.chainId],
        name: "paymaster_hourly_metrics_pkey",
      }),
    };
  },
);

export const paymasterHourlyMetricsNew = pgTable(
  "paymaster_hourly_metrics_new",
  {
    hour: timestamp("hour", { withTimezone: true, mode: "date" }).notNull(),
    paymasterAddress: varchar("paymaster_address").notNull(),
    chainId: integer("chain_id").notNull(),
    totalSponsoredOperationCount: integer(
      "total_sponsored_operation_count",
    ).notNull(),
    totalActualGasCost: numeric("total_actual_gas_cost").notNull(),
  },
  (table) => {
    return {
      paymasterHourlyMetricsNewPkey: primaryKey({
        columns: [table.hour, table.paymasterAddress, table.chainId],
        name: "paymaster_hourly_metrics_new_pkey",
      }),
    };
  },
);

export const globalHourlyMetrics = pgTable(
  "global_hourly_metrics",
  {
    hour: timestamp("hour", { withTimezone: true, mode: "date" }).notNull(),
    chainId: integer("chain_id").notNull(),
    entryPointAddress: varchar("entry_point_address").notNull(),
    sponsored: boolean("sponsored").notNull(),
    success: boolean("success").notNull(),
    totalOperationCount: integer("total_operation_count").notNull(),
    totalActualGasUsed: numeric("total_actual_gas_used").notNull(),
    totalActualGasCost: numeric("total_actual_gas_cost").notNull(),
  },
  (table) => {
    return {
      globalHourlyMetricsPkey: primaryKey({
        columns: [
          table.hour,
          table.chainId,
          table.entryPointAddress,
          table.sponsored,
          table.success,
        ],
        name: "global_hourly_metrics_pkey",
      }),
    };
  },
);

export const dynamicContractRegistry = pgTable(
  "dynamic_contract_registry",
  {
    chainId: integer("chain_id").notNull(),
    registeringEventBlockNumber: integer(
      "registering_event_block_number",
    ).notNull(),
    registeringEventLogIndex: integer("registering_event_log_index").notNull(),
    registeringEventBlockTimestamp: integer(
      "registering_event_block_timestamp",
    ).notNull(),
    registeringEventContractName: text(
      "registering_event_contract_name",
    ).notNull(),
    registeringEventName: text("registering_event_name").notNull(),
    registeringEventSrcAddress: text("registering_event_src_address").notNull(),
    contractAddress: text("contract_address").notNull(),
    contractType: contractType("contract_type").notNull(),
  },
  (table) => {
    return {
      dynamicContractRegistryPkey: primaryKey({
        columns: [table.chainId, table.contractAddress],
        name: "dynamic_contract_registry_pkey",
      }),
    };
  },
);

export const entityHistoryFilter = pgTable(
  "entity_history_filter",
  {
    entityId: text("entity_id").notNull(),
    chainId: integer("chain_id").notNull(),
    oldVal: jsonb("old_val"),
    newVal: jsonb("new_val"),
    blockNumber: integer("block_number").notNull(),
    blockTimestamp: integer("block_timestamp").notNull(),
    previousBlockNumber: integer("previous_block_number"),
    logIndex: integer("log_index").notNull(),
    previousLogIndex: integer("previous_log_index").notNull(),
    entityType: entityType("entity_type").notNull(),
  },
  (table) => {
    return {
      entityHistoryFilterPkey: primaryKey({
        columns: [
          table.entityId,
          table.chainId,
          table.blockNumber,
          table.blockTimestamp,
          table.logIndex,
          table.previousLogIndex,
          table.entityType,
        ],
        name: "entity_history_filter_pkey",
      }),
    };
  },
);

export const entityHistory = pgTable(
  "entity_history",
  {
    entityId: text("entity_id").notNull(),
    blockTimestamp: integer("block_timestamp").notNull(),
    chainId: integer("chain_id").notNull(),
    blockNumber: integer("block_number").notNull(),
    logIndex: integer("log_index").notNull(),
    entityType: entityType("entity_type").notNull(),
    params: jsonb("params"),
    previousBlockTimestamp: integer("previous_block_timestamp"),
    previousChainId: integer("previous_chain_id"),
    previousBlockNumber: integer("previous_block_number"),
    previousLogIndex: integer("previous_log_index"),
  },
  (table) => {
    return {
      entityTypeEntityIdBlockTimestamp: index(
        "entity_history_entity_type_entity_id_block_timestamp",
      ).using(
        "btree",
        table.entityType.asc().nullsLast(),
        table.entityId.asc().nullsLast(),
        table.blockTimestamp.asc().nullsLast(),
      ),
      entityHistoryPkey: primaryKey({
        columns: [
          table.entityId,
          table.blockTimestamp,
          table.chainId,
          table.blockNumber,
          table.logIndex,
          table.entityType,
        ],
        name: "entity_history_pkey",
      }),
    };
  },
);

export const rawEvents = pgTable(
  "raw_events",
  {
    chainId: integer("chain_id").notNull(),
    eventId: numeric("event_id").notNull(),
    eventName: text("event_name").notNull(),
    contractName: text("contract_name").notNull(),
    blockNumber: integer("block_number").notNull(),
    logIndex: integer("log_index").notNull(),
    srcAddress: text("src_address").notNull(),
    blockHash: text("block_hash").notNull(),
    blockTimestamp: integer("block_timestamp").notNull(),
    blockFields: jsonb("block_fields").notNull(),
    transactionFields: jsonb("transaction_fields").notNull(),
    params: jsonb("params").notNull(),
    dbWriteTimestamp: timestamp("db_write_timestamp", {
      mode: "date",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      rawEventsPkey: primaryKey({
        columns: [table.chainId, table.eventId],
        name: "raw_events_pkey",
      }),
    };
  },
);
