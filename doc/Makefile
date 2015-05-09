DOT=$(shell find . -type f -name '*.dot')
PNG=$(DOT:.dot=.png)

.PHONY: all clean

all: $(PNG)
clean:
	$(RM) $(PNG)

%.png: %.dot
	dot -Tpng $< -o $@
