# Block and Scope in Go

Go is lexically scoped (static scoped), like C

```go
func main() {
  {
    a := 1
    fmt.Println(a)
    {
      b := 100
      fmt.Println(a)
      fmt.Println(b)
    }
    // fmt.Println(b)  // undefined:b
  }
  // fmt.Println(a) // undefined:a
  // fmt.Println(b) // undefined:b
}
```

## Implicit blocks
* universe block contains all source code
* package block contains all package’s source code (package can be `spread over several files` in a single directory),
* file block contains file’s source code
* for statement is in its own implicit block:
```go
for i := 0; i < 5; i++ {
    fmt.Println(i)
}
// fmt.Println(i) // undefined:i
```
* if statement is in its own implicit block
```go
if i := 0; i >= 0 {
    fmt.Println(i)
}
// fmt.Println(i) // undefined:i
```
* switch statement is in its own implicit block
```go
switch i := 2; i * 4 {
case 8:
    fmt.Println(i)
default:
    fmt.Println("default")
}
```
* each clause in a switch statement acts like a implicit block
```go
switch i := 2; i * 4 {
case 8:
    j := 0
    fmt.Println(i, j)
default:
    // fmt.Println(j) // undefined:j
}
```

* each clause in select statement acts like a implicit block. It’s analogous case as with clauses in switch statements
```go
    tick := time.Tick(100 * time.Millisecond)
LOOP:
    for {
        select {
        case <-tick:
            i := 0
            fmt.Println(“tick”, i)
            break LOOP
        default:
            // "i" is undefined here
            fmt.Println(“sleep”)
            time.Sleep(30 * time.Millisecond)
        }
    }
    // "i" is undefined here
```



## References
* https://medium.com/golangspec/blocks-in-go-2f68768868f6
* https://medium.com/golangspec/scopes-in-go-a6042bb4298c
* https://medium.com/golangspec/exported-identifiers-in-go-518e93cc98af
