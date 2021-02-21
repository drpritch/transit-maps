find . \
    | grep png\$ \
    | sed 's#\(.*\).png#../pngnq-1.1/src/pngnq -f -s 1 \1.png \&\& mv \1-nq8.png \1.png \&\& optipng -o7 \1.png#'
