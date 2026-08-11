# Controle de estoque

## Entities

- Product (barcode, name, quantityInStock)
- ProductOrder (id, Product, orderQuantity, orderDate)
- ProductInput (id, ProductOrder, inputQuantity, inputDate)
- ProductOutput (id, barcode, outputQuantity, outputDate)

## Outros campos
- Average Lead Time = média do calculo do tempo entre pedido e entrada de cada produto.
- Average Product Output Per Day = média de saída de cada produto por dia.
- Resupply point = Lead Time * Average Product Output Per Day