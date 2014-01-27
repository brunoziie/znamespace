var znamespace;

(function (scope) {
    "use strict";
    scope.znamespace = {};

    var define, 
        register, 
        greet, 
        bind,
        listen,
        depends,
        __import,
        checkNotLoaded,
        dependencies = {},
        loadedModules = {},
        queue = {};

    /**
     * Traz a instancia de um modulos ja definido
     * @param  {string} path Namespace do modulo
     * @return {mixed}       Objeto caso exista ou null do contrário
     */
    __import = function (path) {

        var parts, i, len, space;

        if (typeof path != 'string') {
            return;
        }

        parts = path.split('.');
        len = parts.length;

        space = scope.znamespace;

        for (i = 0; i < len; i += 1) {
            if (typeof space[parts[i]] === 'undefined') {
                return null;
            }

            space = space[parts[i]] = space[parts[i]] || {};
        }

        return space;

    };

    /**
     * Salva a lista de dependecias de um modulo
     * @param  {string} path    Namespace do modulo
     * @param  {array}  modules Array com os namespaces dos modulos dependentes
     * @return {void}
     */
    depends = function (path, modules) {
        dependencies[path] = {
            required: modules,
            loaded: []
        }
    };

    /**
     * Retorna uma lista com os modulos dependentes que ainda não foram definidos
     * @param  {array} dependencies Array com os namespaces dos modulos dependentes
     * @return {array}              Array com apenas os modulos nao definidos
     */
    checkNotLoaded = function(dependencies) {
        var i, 
            out = [],
            current,
            len = dependencies.length;

        for (i = 0; i < len; i += 1) {
            current = dependencies[i];

            if (typeof loadedModules[current] === 'undefined') {
                out.push(current);
            }
        }

        return out;
    };

    /**
     * Define um listener que estão sendo esperados que sejam definidos
     * @param  {string}   path     Namespace do modulos que está sendo aguardado
     * @param  {string}   listener Namespace do modulo que está aguardando
     * @param  {Function} callback Funcão de callback que inicia o modulo quando todas as suas dependecias estiverem definidas
     * @return {void}
     */
    listen = function (path, listener, callback) {
        queue[path] = queue[path] || [];
        queue[path].push(function () {
            var dependenceList = dependencies[listener];

            dependenceList.loaded.push(path);

            if (dependenceList.loaded.length === dependenceList.required.length) {
                callback();
            }
        });
    };

    /**
     * Dispara um evento quando um novo modulo é definido
     * @param  {string} path Namespace do novo modulo
     * @return {void}
     */
    greet = function (path) {
        var i, len, row;

        loadedModules[path] = true;

        if (typeof queue[path] !== 'undefined') {
            row = queue[path];
            len = row.length;

            for (i = 0; i < len; i += 1) {
                row[i]();
            } 
        }
    };

    /**
     * Registra o namespace para um modulo
     * @param  {string} path Namespace
     * @return {object}
     */
    register = function (path) {
        var parts, i, len, space;

        if (typeof path != 'string') {
            return;
        }

        parts = path.split('.');
        len = parts.length;

        space = scope.znamespace;

        for (i = 0; i < len; i += 1) {
            space = space[parts[i]] = space[parts[i]] || {};
        }

        return space;
    };

    /**
     * Define um novo modulo
     * @param  {string} path    Namespace do modulo
     * @param  {array}  require Array com os namespaces dependentes
     * @param  {mixed}  def     Implementação do modulo
     * @return {void}
     */
    define = function(path, require, def) {
        var namespace = register(path),
            chkdef = (arguments.length < 3) ? require : def,
            dep = (arguments.length === 3) ? require : [],
            definition = (typeof chkdef === 'function') ? new chkdef() : chkdef,
            initCallback,
            item,
            notLoadedDeps,
            depLen,
            x;

        if (typeof definition != 'object') {
            throw new Error('Parameter "def" must to be a function or object');
        }

        for (item in definition) {
            if(definition.hasOwnProperty(item) === true) {
                namespace[item] = definition[item];
            }
        }

        namespace['__import'] = __import;

        initCallback = function () {
            if (typeof namespace.init !== 'undefined') {
                namespace.init();
            }

            greet(path);
        };

        notLoadedDeps = checkNotLoaded(dep);
        depLen = notLoadedDeps.length;

        if (depLen > 0) {
            depends(path, notLoadedDeps);

            for (x = 0; x < depLen; x += 1) {
                listen(notLoadedDeps[x], path, initCallback);
            }

        } else {
            initCallback();
        }
    };

    scope.define = define;
}(window));
