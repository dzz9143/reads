# [Effective Go](https://golang.org/doc/effective_go.html)

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


## Data
Go has two allocation primitives, the built-in functions `new` and `make`. They do different things and apply to different types, which can be confusing, but the rules are simple.

### Allocate with new
`new` a built-in function that allocates memory, but unlike its namesakes in some other languages it `does not initialize the memory, it only zeros it`.

`new(T)` allocates zeroed storage for a new item of type T and returns its address, a value of type *T. In Go terminology, `it returns a pointer to a newly allocated zero value of type T`.

### Constructors and composite literals
```go
func NewFile1(fd int, name string) *File {
    if fd < 0 {
        return nil
    }
    f := new(File)
    f.fd = fd
    f.name = name
    f.dirinfo = nil
    f.nepipe = 0
    return f
}

func NewFile2(fd int, name string) *File {
    if fd < 0 {
        return nil
    }
    f := File{fd, name, nil, 0}
    return &f
}
```
Note that, unlike in C, it's perfectly OK to return the address of a local variable; `the storage associated with the variable survives after the function returns`.
```go
return &File{fd, name, nil, 0}

// or...

return &File{fd: fd, name: name}
```
The fields of a composite literal are laid out in order and `must all be present` (first one). However, by labeling the elements explicitly as `field:value pairs` (second one), the initializers can appear in any order, with the missing ones left as their `respective zero values`.

As a limiting case, if a composite literal contains no fields at all, it creates a zero value for the type. `The expressions new(File) and &File{} are equivalent`.

### Allocate with make
It creates `slices, maps, and channels only`, and it returns an `initialized (not zeroed) value of type T` (not *T). The reason for the distinction is that these three types represent, under the covers, references to data structures that must be initialized before use.

### Array
* Arrays are values. Assigning one array to another copies all the elements
* The size of an array is part of its type. The types [10]int and [20]int are distinct

### Slice
* most array programming in Go is done with slices rather than simple arrays
```go
func Append(slice, data []byte) []byte {
    l := len(slice)
    if l + len(data) > cap(slice) {  // reallocate
        // Allocate double what's needed, for future growth.
        newSlice := make([]byte, (l+len(data))*2)
        // The copy function is predeclared and works for any slice type.
        copy(newSlice, slice)
        slice = newSlice
    }
    slice = slice[0:l+len(data)]
    copy(slice[l:], data)
    return slice
}

// two-dimensional
// Allocate the top-level slice.
picture := make([][]uint8, YSize) // One row per unit of y.
// Loop over the rows, allocating the slice for each row.
for i := range picture {
	picture[i] = make([]uint8, XSize)
}
```

### Append
```go
// append T
x := []int{1,2,3}
x = append(x, 4, 5, 6)
fmt.Println(x)

// append []T
x := []int{1,2,3}
y := []int{4,5,6}
x = append(x, y...)
fmt.Println(x)
```

## Initialization

### Const
* const are created at `compile time`

### Variables
* Variables can be initialized just like constants but the initializer can be a general expression `computed at run time` 

### The init function
* init is called after all the variable declarations in the package have evaluated their initializers, and those are evaluated only after all the imported packages have been initialized.
* a common use of init functions is to verify or repair correctness of the program state before real execution begins

## Methods (?)
The rule about pointers vs. values for receivers is that `value methods can be invoked on pointers and values`, but `pointer methods can only be invoked on pointers`

check out the implementation of bytes.Buffer

## Pointer vs Value
The rule abount Pointers vs. Values for receivers is that `value methods can be invoked on both pointers and values`, but `pointer methods can only be invoked on pointers`

(!) Because `pointer methods can modify the receiver`; invoking them on a value would cause the method to receive `a copy of the value`, so any modifications would be discarded. The language therefore disallows this mistake.

## Interfaces and other types
Interfaces in go provide a way to specify the behavior of an object: all in all, `if something can do this, it can be used here`

### Interfaces and methods
A struct, an integer, `a channel`, and `a function` can implment an interface, all because interfaces are just sets of methods, which can be defined for (almost) any type

## The blank identifier
It represents a write-only value to be used as a place-holder where `a variable is needed but the actual value is irrelevant`. 

* can be used to handle multiple assignments
    ```go
    if _, err := os.Stat(path); os.IsNotExist(err) {
        fmt.Printf("%s does not exist\n", path)
    }
    ```
* unused imports and variables
    ```go
    // To silence complaints about the unused imports, use a blank identifier to refer to a symbol from the imported package
    package main

    import (
        "fmt"
        "io"
        "log"
        "os"
    )

    var _ = fmt.Printf // For debugging; delete when done.
    var _ io.Reader    // For debugging; delete when done.

    func main() {
        fd, err := os.Open("test.go")
        if err != nil {
            log.Fatal(err)
        }
        // TODO: use fd.
        _ = fd
    }
    ```
* Import for side effect
    ```go
    // This form of import makes clear that the package is being imported for its side effects, because there is no other possible use of the package: in this file, `it doesn't have a name`
    import _ "net/http/pprof"
    ```
*  Interface check
```go
// If it's necessary only to ask whether a type implements an interface, without actually using the interface itself, perhaps as part of an error check, use the blank identifier to ignore the type-asserted value
if _, ok := val.(json.Marshaler); ok {
    fmt.Printf("value %v of type %T implements json.Marshaler\n", val, val)
}
```
