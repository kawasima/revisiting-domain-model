# Revisiting Domain Model

ドメインモデルの設計において、現実問題、性能と純粋性、完全性の間にトリレンマがあって、一度に全部満たすことができない、と言われている。
https://enterprisecraftsmanship.com/posts/domain-model-purity-completeness/

この問題を実装例とともに考えてみよう、という試みです。

* [純粋性+完全性](./src/victim_performance.ts)
* [性能+完全性](./src/victim_purity.ts)
* [性能+純粋性](./src/victim_completeness.ts)
* [集約分割](./src/split_aggregate.ts): 集約を分割するとマシになる?
* [関数型DDDアプローチ](./src/made_functional.ts): Domain Modeling Made Functionalなアプローチ

