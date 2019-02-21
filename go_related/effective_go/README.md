# Effective Go

## Name
* the visibility of a name `outside a package` is determined by whether `its first character is upper case`.
* package name should `short`, `concise` and `evocative`, and should be `lower case`, `single-world` name; there should be no need for underscores or mixedCaps.
* package name is base name of its source directory
    ```
      src/encoding/base64 => import "encoding/base64" => base64.xxx
    ```
* by convention, one-method interfaces are named by the method name plus an `-er suffix` or similar modification to construct an agent noun: Reader, Writer, Formatter, CloseNotifier etc.
* the convention in Go is to use `MixedCaps or mixedCaps` rather than underscores to write multiword names. 

## Control Structures

### Redeclaration and reassignment
Given code
```go
f, err := os.Open(name)
d, err := f.Stat()
```
f and d is declared, but `err only re-assigned`

It's worth noting here that in Go the scope of `function parameters and return values is the same as the function body`, even though they appear lexically outside the braces that enclose the body.


### For
Go unifies for and while and `there is no do-while`
```go
// Like a C for
for init; condition; post {}

// Like a C while
for condition {}

// Like a C for(;;)
for {}
```

If you're looping over an `array, slice, string, or map, or reading from a channel`, a range clause can manage the loop.
```go
for key, value := range m {
  //...
}
```

### Switch
Go's switch is more general than C's. The expressions `need not be constants or even integers`, the cases are evaluated `top to bottom until a match is found`
```go
func unhex(c byte) byte {
    switch {
    case '0' <= c && c <= '9':
        return c - '0'
    case 'a' <= c && c <= 'f':
        return c - 'a' + 10
    case 'A' <= c && c <= 'F':
        return c - 'A' + 10
    }
    return 0
}
```

Sometimes, it's necessary to break out of a surrounding loop, not the switch, and in Go that can be accomplished by putting a `label on the loop and "breaking" to that label`. This example shows both uses.

```go
Loop:
	for n := 0; n < len(src); n += size {
		switch {
		case src[n] < sizeOne:
			if validateOnly {
				break
			}
			size = 1
			update(src[n])

		case src[n] < sizeTwo:
			if n+1 >= len(src) {
				err = errShortInput
				break Loop
			}
			if validateOnly {
				break
			}
			size = 2
			update(src[n] + src[n+1]<<shift)
		}
	}
```

### Type Switch
A switch can also be used to discover the `dynamic type of an interface variable`. Such a type switch uses the syntax of a `type assertion` with the keyword type inside the parentheses
```go
var t interface{}
t = functionOfSomeType()
switch t := t.(type) {
default:
    fmt.Printf("unexpected type %T\n", t)     // %T prints whatever type t has
case bool:
    fmt.Printf("boolean %t\n", t)             // t has type bool
case int:
    fmt.Printf("integer %d\n", t)             // t has type int
case *bool:
    fmt.Printf("pointer to boolean %t\n", *t) // t has type *bool
case *int:
    fmt.Printf("pointer to integer %d\n", *t) // t has type *int
}
```


## Functions 
### Named result parameters
The return or result "parameters" of a Go function can be given names and used as regular variables, just like the incoming parameters. `When named, they are initialized to the zero values` for their types when the function begins.

if the function executes a return statement with no arguments, the current values of the result parameters are used as the returned values.

### Defer
Go's defer statement schedules a function call (the deferred function) to be run immediately before the function executing the defer returns
```go
// Contents returns the file's contents as a string.
func Contents(filename string) (string, error) {
    f, err := os.Open(filename)
    if err != nil {
        return "", err
    }
    defer f.Close()  // f.Close will run when we're finished.
    // ....
}
```
The arguments to the deferred function (which include the receiver if the function is a method) are evaluated `when the defer executes, not when the call executes`.
```go
for i := 0; i < 5; i++ {
    defer fmt.Printf("%d ", i)
}
```
Deferred functions are executed in `LIFO order`, so this code will cause 4 3 2 1 0 to be printed when the function returns.