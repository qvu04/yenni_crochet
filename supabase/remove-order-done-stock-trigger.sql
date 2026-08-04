-- Yenni Crochet - remove legacy stock decrement trigger on order done
--
-- Current cart order creation already decrements product/product_variant stock in
-- create_cart_order_with_promotion(). A legacy trigger that decrements stock
-- again when orders.status becomes 'done' can make status updates fail with:
-- "Sản phẩm không đủ tồn kho".

do $$
declare
  trigger_record record;
begin
  for trigger_record in
    select trigger_name
    from information_schema.triggers
    where event_object_schema = 'public'
      and event_object_table = 'orders'
      and action_statement ilike '%decrease_product_stock_on_order_done%'
  loop
    execute format(
      'drop trigger if exists %I on public.orders',
      trigger_record.trigger_name
    );
  end loop;
end $$;

drop function if exists public.decrease_product_stock_on_order_done();
