-- =============================================================================
-- GIN Index Migration for JSONB Biochemical Parameters
-- =============================================================================
-- This index enables sub-millisecond queries on the `biochem_params` JSONB column
-- in the `listings` table. Required for the advanced search engine.
--
-- TypeORM's synchronize cannot create GIN indexes, so this must be run manually.
-- Run this AFTER the first NestJS startup (which creates the tables via synchronize).
-- =============================================================================

-- GIN index on biochem_params for advanced filtering
CREATE INDEX IF NOT EXISTS idx_listings_biochem
  ON listings USING GIN (biochem_params);

-- B-tree index on price for range queries
CREATE INDEX IF NOT EXISTS idx_listings_price
  ON listings (price_per_unit);

-- B-tree index on status for filtered queries
CREATE INDEX IF NOT EXISTS idx_listings_status
  ON listings (status);

-- B-tree index on county for regional filtering
CREATE INDEX IF NOT EXISTS idx_listings_county
  ON listings (county);

-- Composite index for common query pattern: status + category
CREATE INDEX IF NOT EXISTS idx_listings_status_commodity
  ON listings (status, commodity_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer
  ON orders (buyer_id);

CREATE INDEX IF NOT EXISTS idx_orders_seller
  ON orders (seller_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders (status);

CREATE INDEX IF NOT EXISTS idx_orders_ref
  ON orders (order_ref);
