#include "stdio.h"
#include "stdlib.h"

char *printBinaryFormatString(int num)
{
    int len = sizeof(int) * 8;
    char *res = (char *)malloc(len + 1);
    res[len] = 0;
    int mask = 1;
    for (int i = 0; i != len; ++i)
    {
        res[len - i - 1] = (mask & num) ? '1' : '0';
        mask <<= 1;
    }
    return res;
}

int main()
{
    char *s1 = printBinaryFormatString(1);
    char *s2 = printBinaryFormatString(10);
    char *s3 = printBinaryFormatString(-1);
    printf("%s\n", s1);
    printf("%s\n", s2);
    printf("%s\n", s3);
    return 0;
}