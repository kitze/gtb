##!/bin/bash
echo "Generating hash-ed asset files"
# Wait untill the css is finished
while [ ! -f build/css/styles.css ]; do sleep 1; done
sleep 2
cd build
# templates must come before app.js because they're replaced in the app.js file
for file in  `find templates -type f` "css/lib.css" "css/styles.css" "js/lib.js" "js/app.js"
do
    hash=`md5sum $file | awk '{print $1}'`;
    filebase=${file%.*} # the base filename
    ext=${file##*.} # the extension
    newfile=$filebase-$hash.$ext
    echo "hashing $file to $newfile"
    mv $file $newfile
    simplefilename=$(basename "$file")
    simplenewfilename=$(basename "$newfile")
    if [ $ext = "html" ]; then
        sed -i "s/$simplefilename/$simplenewfilename/g" js/app.js
    else
        sed -i "s/$simplefilename/$simplenewfilename/g" index.html
    fi
done
