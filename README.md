znamespace
==========

Um simples gerenciador de namespaces e dependências

**define( path, require, def )**

| Tipo            | Parâmetro                   | Descrição                           |
| --------------- |-----------------------------| ----------------------------------- |
| _String_        | **path**                    | Namespace do modulo                 |
| _Array_         | **require**                 | Array com os namespaces dependentes |
| _Mixed_         | **def**                     | Implementação do modulo             |

### Uso
```javascript
define('app.views', ['app.controllers'], {
	init: function () {
		console.log('app.controllers loaded');
	}
});
```
O método `init` é chamado sempre que o modulo, assim como todas as duas dependências foram definidas


### Importando modulos
Todos os modulos possuem o método **__import()** que permite importar a instancia de um modulo já definido. Se o modulo requisitado não estiver sido definido ainda, o retorno será **null**.

```javascript
define('app.views', ['app.models'], {

	init: function () {
		var User = this.__import('app.models.user');
	}

});
```

