(function (tree) {

//
// A function call node.
//
tree.Call = function (name, args, index, currentFileInfo) {
    this.name = name;
    this.args = args;
    this.index = index;
    this.currentFileInfo = currentFileInfo;
};
tree.Call.prototype = {
    type: "Call",
    accept: function (visitor) {
        this.args = visitor.visit(this.args);
    },
    //
    // When evaluating a function call,
    // we either find the function in `tree.functions` [1],
    // in which case we call it, passing the  evaluated arguments,
    // if this returns null or we cannot find the function, we 
    // simply print it out as it appeared originally [2].
    //
    // The *functions.js* file contains the built-in functions.
    //
    // The reason why we evaluate the arguments, is in the case where
    // we try to pass a variable to a function, like: `saturate(@color)`.
    // The function should receive the value, not the variable.
    //
    eval: function (env) {
        var args = this.args.map(function (a) { return a.eval(env); }),
            nameLC = this.name.toLowerCase(),
            result, func;

        args.push();

	    if (nameLC in tree.functions || nameLC in env.functions) { // 1.
		    try {
                func = new tree.functionCall(env, this.currentFileInfo);
                result = (func[nameLC] || env.functions[nameLC]).apply(func, args);
                if (result != null) {
                    return result;
                }
		    } catch (e) {
                throw { type: e.type || "Runtime",
                        message: "error evaluating function `" + this.name + "`" +
                                 (e.message ? ': ' + e.message : ''),
                        index: this.index, filename: this.currentFileInfo.filename };
            }
        }
        
        // 2.
            return new(tree.Anonymous)(this.name +
            "(" + args.map(function (a) { return a.toCSS(env); }).join(', ') + ")");
    },

    toCSS: function (env) {
        return this.eval(env).toCSS();
    }
};

})(require('../tree'));
