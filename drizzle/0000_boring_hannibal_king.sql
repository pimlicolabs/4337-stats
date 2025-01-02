-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
DO $$ BEGIN
 CREATE TYPE "public"."contract_type" AS ENUM('EntryPointV06', 'EntryPointV07');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."entity_type" AS ENUM('EntryPoint_AccountDeployed', 'EntryPoint_UserOperationEvent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "EntryPoint_AccountDeployed" (
	"blockHash" text NOT NULL,
	"blockNumber" numeric NOT NULL,
	"blockTimestamp" timestamp with time zone NOT NULL,
	"chainId" integer NOT NULL,
	"factory" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"paymaster" text NOT NULL,
	"sender" text NOT NULL,
	"transactionHash" text NOT NULL,
	"db_write_timestamp" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "EntryPoint_UserOperationEvent" (
	"actualGasCost" numeric NOT NULL,
	"actualGasUsed" numeric NOT NULL,
	"blockHash" text NOT NULL,
	"blockNumber" numeric NOT NULL,
	"blockTimestamp" timestamp with time zone NOT NULL,
	"chainId" integer NOT NULL,
	"entryPoint" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"logIndex" integer NOT NULL,
	"nonce" numeric NOT NULL,
	"paymaster" text NOT NULL,
	"sender" text NOT NULL,
	"success" boolean NOT NULL,
	"transactionFrom" text NOT NULL,
	"transactionHash" text NOT NULL,
	"transactionIndex" integer NOT NULL,
	"db_write_timestamp" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aggregate_tracking" (
	"aggregate_name" varchar(100) PRIMARY KEY NOT NULL,
	"last_processed_timestamp" timestamp with time zone DEFAULT '2023-01-01 00:00:00+00' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bundlers" (
	"name" varchar(50) NOT NULL,
	"address" varchar(42) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chain_metadata" (
	"chain_id" integer PRIMARY KEY NOT NULL,
	"start_block" integer NOT NULL,
	"end_block" integer,
	"block_height" integer NOT NULL,
	"first_event_block_number" integer,
	"latest_processed_block" integer,
	"num_events_processed" integer,
	"is_hyper_sync" boolean NOT NULL,
	"num_batches_fetched" integer NOT NULL,
	"latest_fetched_block_number" integer NOT NULL,
	"timestamp_caught_up_to_head_or_endblock" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_sync_state" (
	"chain_id" integer PRIMARY KEY NOT NULL,
	"block_number" integer NOT NULL,
	"log_index" integer NOT NULL,
	"block_timestamp" integer NOT NULL,
	"is_pre_registering_dynamic_contracts" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "factories" (
	"name" varchar(50) NOT NULL,
	"address" varchar(42) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paymasters" (
	"name" varchar(50) NOT NULL,
	"address" varchar(42) PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "persisted_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"envio_version" text NOT NULL,
	"config_hash" text NOT NULL,
	"schema_hash" text NOT NULL,
	"handler_files_hash" text NOT NULL,
	"abi_files_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "active_accounts_daily_metrics" (
	"date" date NOT NULL,
	"chain_id" integer NOT NULL,
	"unique_active_senders" integer NOT NULL,
	CONSTRAINT "active_accounts_daily_metrics_pkey" PRIMARY KEY("date","chain_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "active_accounts_monthly_metrics" (
	"month" date NOT NULL,
	"chain_id" integer NOT NULL,
	"unique_active_senders" integer NOT NULL,
	CONSTRAINT "active_accounts_monthly_metrics_pkey" PRIMARY KEY("month","chain_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "end_of_block_range_scanned_data" (
	"chain_id" integer NOT NULL,
	"block_timestamp" integer NOT NULL,
	"block_number" integer NOT NULL,
	"block_hash" text NOT NULL,
	CONSTRAINT "end_of_block_range_scanned_data_pkey" PRIMARY KEY("chain_id","block_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "factory_hourly_metrics" (
	"hour" timestamp with time zone NOT NULL,
	"factory_address" varchar NOT NULL,
	"chain_id" integer NOT NULL,
	"total_accounts_deployed" numeric NOT NULL,
	CONSTRAINT "factory_hourly_metrics_pkey" PRIMARY KEY("hour","factory_address","chain_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bundler_hourly_metrics" (
	"hour" timestamp with time zone NOT NULL,
	"bundler_name" varchar NOT NULL,
	"chain_id" integer NOT NULL,
	"total_operation_count" integer NOT NULL,
	"total_actual_gas_cost" numeric NOT NULL,
	CONSTRAINT "bundler_hourly_metrics_pkey" PRIMARY KEY("hour","bundler_name","chain_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paymaster_hourly_metrics" (
	"hour" timestamp with time zone NOT NULL,
	"paymaster_name" varchar NOT NULL,
	"chain_id" integer NOT NULL,
	"total_sponsored_operation_count" integer NOT NULL,
	"total_actual_gas_cost" numeric NOT NULL,
	CONSTRAINT "paymaster_hourly_metrics_pkey" PRIMARY KEY("hour","paymaster_name","chain_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paymaster_hourly_metrics_new" (
	"hour" timestamp with time zone NOT NULL,
	"paymaster_address" varchar NOT NULL,
	"chain_id" integer NOT NULL,
	"total_sponsored_operation_count" integer NOT NULL,
	"total_actual_gas_cost" numeric NOT NULL,
	CONSTRAINT "paymaster_hourly_metrics_new_pkey" PRIMARY KEY("hour","paymaster_address","chain_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "global_hourly_metrics" (
	"hour" timestamp with time zone NOT NULL,
	"chain_id" integer NOT NULL,
	"entry_point_address" varchar NOT NULL,
	"sponsored" boolean NOT NULL,
	"success" boolean NOT NULL,
	"total_operation_count" integer NOT NULL,
	"total_actual_gas_used" numeric NOT NULL,
	"total_actual_gas_cost" numeric NOT NULL,
	CONSTRAINT "global_hourly_metrics_pkey" PRIMARY KEY("hour","chain_id","entry_point_address","sponsored","success")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dynamic_contract_registry" (
	"chain_id" integer NOT NULL,
	"registering_event_block_number" integer NOT NULL,
	"registering_event_log_index" integer NOT NULL,
	"registering_event_block_timestamp" integer NOT NULL,
	"registering_event_contract_name" text NOT NULL,
	"registering_event_name" text NOT NULL,
	"registering_event_src_address" text NOT NULL,
	"contract_address" text NOT NULL,
	"contract_type" "contract_type" NOT NULL,
	CONSTRAINT "dynamic_contract_registry_pkey" PRIMARY KEY("chain_id","contract_address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entity_history_filter" (
	"entity_id" text NOT NULL,
	"chain_id" integer NOT NULL,
	"old_val" jsonb,
	"new_val" jsonb,
	"block_number" integer NOT NULL,
	"block_timestamp" integer NOT NULL,
	"previous_block_number" integer,
	"log_index" integer NOT NULL,
	"previous_log_index" integer NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	CONSTRAINT "entity_history_filter_pkey" PRIMARY KEY("entity_id","chain_id","block_number","block_timestamp","log_index","previous_log_index","entity_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entity_history" (
	"entity_id" text NOT NULL,
	"block_timestamp" integer NOT NULL,
	"chain_id" integer NOT NULL,
	"block_number" integer NOT NULL,
	"log_index" integer NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"params" jsonb,
	"previous_block_timestamp" integer,
	"previous_chain_id" integer,
	"previous_block_number" integer,
	"previous_log_index" integer,
	CONSTRAINT "entity_history_pkey" PRIMARY KEY("entity_id","block_timestamp","chain_id","block_number","log_index","entity_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "raw_events" (
	"chain_id" integer NOT NULL,
	"event_id" numeric NOT NULL,
	"event_name" text NOT NULL,
	"contract_name" text NOT NULL,
	"block_number" integer NOT NULL,
	"log_index" integer NOT NULL,
	"src_address" text NOT NULL,
	"block_hash" text NOT NULL,
	"block_timestamp" integer NOT NULL,
	"block_fields" jsonb NOT NULL,
	"transaction_fields" jsonb NOT NULL,
	"params" jsonb NOT NULL,
	"db_write_timestamp" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "raw_events_pkey" PRIMARY KEY("chain_id","event_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_AccountDeployed_blockTimestamp" ON "EntryPoint_AccountDeployed" USING btree ("blockTimestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_AccountDeployed_chainId" ON "EntryPoint_AccountDeployed" USING btree ("chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_AccountDeployed_factory" ON "EntryPoint_AccountDeployed" USING btree ("factory");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_AccountDeployed_paymaster" ON "EntryPoint_AccountDeployed" USING btree ("paymaster");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_AccountDeployed_transactionHash" ON "EntryPoint_AccountDeployed" USING btree ("transactionHash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_accountdeployed_sender_chainid" ON "EntryPoint_AccountDeployed" USING btree ("sender","chainId","factory");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_UserOperationEvent_blockTimestamp" ON "EntryPoint_UserOperationEvent" USING btree ("blockTimestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_UserOperationEvent_chainId" ON "EntryPoint_UserOperationEvent" USING btree ("chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_UserOperationEvent_entryPoint" ON "EntryPoint_UserOperationEvent" USING btree ("entryPoint");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_UserOperationEvent_paymaster" ON "EntryPoint_UserOperationEvent" USING btree ("paymaster");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_UserOperationEvent_sender" ON "EntryPoint_UserOperationEvent" USING btree ("sender");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_UserOperationEvent_success" ON "EntryPoint_UserOperationEvent" USING btree ("success");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_UserOperationEvent_transactionFrom" ON "EntryPoint_UserOperationEvent" USING btree ("transactionFrom");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EntryPoint_UserOperationEvent_transactionHash" ON "EntryPoint_UserOperationEvent" USING btree ("transactionHash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_eup_blocktimestamp" ON "EntryPoint_UserOperationEvent" USING btree ("blockTimestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_eup_transactionfrom_chainid" ON "EntryPoint_UserOperationEvent" USING btree ("transactionFrom","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entity_history_entity_type_entity_id_block_timestamp" ON "entity_history" USING btree ("entity_type","entity_id","block_timestamp");
*/