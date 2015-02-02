#printf '"%s"\n' */ | xargs -L 1 bash -c 'cd "$1" && echo $1 && ~/documents/git-stats-importer/bin/git-stats-importer' _
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
