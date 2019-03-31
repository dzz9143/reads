# Property Check and Type Check
## About Property Check
### !! 
!! 是用来检查某个对象属性的「值」是真还是假，并不是用来检查对象的某个属性「是否存在」。它会对值进行转换并且会检查 prototype 链

### hasOwnProperty
hasOwnProperty 不会检查「原形链」。使用的时候需要注意对象本身可能有这个名字的属性，比如：
```javascript
var a = {
  hasOwnProperty: 1
}
```

为了保证正常的使用，防止被覆盖或者复写
```javascript
Object.prototype.hasOwnProperty.call(obj, 'props');
```

### in 
in 会检查原形链
```javascript
'toString' in myObj
```

## About Type Check
### types
* Number
* String
* Boolean
* Object
  * Function
  * Array
  * Date
  * RegExp
* Null
* Undefined

Number, String, Boolean 是 Primitives，The `Primitive types` are wrapped by their `Object counterparts` when called, JavaScript will dive between the Number/String/Boolean to an Object when needed (coercion). Underneath, it will infact construct an Object, use it, then return the result

typeof 并不可靠

最可靠的方式如下:
```javascript
Object.prototype.toString.call();
```

尝试一下:
```javascript
Object.prototype.toString.call([]); // [object Array]
Object.prototype.toString.call({}); // [object Object]
Object.prototype.toString.call(''); // [object String]
Object.prototype.toString.call(new Date()); // [object Date]
Object.prototype.toString.call(1); // [object Number]
Object.prototype.toString.call(function () {}); // [object Function]
Object.prototype.toString.call(/test/i); // [object RegExp]
Object.prototype.toString.call(true); // [object Boolean]
Object.prototype.toString.call(null); // [object Null]
Object.prototype.toString.call(); // [object Undefined]
```

## Reference
* https://toddmotto.com/methods-to-determine-if-an-object-has-a-given-property
* https://toddmotto.com/understanding-javascript-types-and-reliable-type-checking/
