#!/bin/bash
for sour in */ ; do
    echo ">> $sour"
    cd $sour
    for org in */ ; do
        echo ">> $org"
        cd $org
        for repo in */ ; do
            cd $repo
            echo ">> $repo"
            ~/Documents/git-stats-importer/bin/git-stats-importer
            cd ..
        done
        cd ..
    done
    cd ..
done
