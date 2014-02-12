#!/bin/sh

# splt stationname radius 
#
txsplt () {
      echo "Transferring" $1
      scp -i ~/.ssh/farmradio.pem ec2-user@54.221.105.237:/home/ec2-user/splat-radiomap/$1.png .
      scp -i ~/.ssh/farmradio.pem ec2-user@54.221.105.237:/home/ec2-user/splat-radiomap/$1-ck.png .
      scp -i ~/.ssh/farmradio.pem ec2-user@54.221.105.237:/home/ec2-user/splat-radiomap/$1.kml .
      sed -e "s/<href>$1.ppm<\/href>/<href>.\/$1.png<\/href>/g" -e "s/<href>$1-ck.ppm<\/href>/<href>.\/$1-ck.png<\/href>/g"  $1.kml > $1-png.kml
      convert $1.png $1.jpg
      sed -e "s/<href>$1.ppm<\/href>/<href>.\/$1.jpg<\/href>/g" -e "s/<href>$1-ck.ppm<\/href>/<href>.\/$1-ck.png<\/href>/g"  $1.kml > $1-jpg.kml
  }

mkcd () {
  if [ $# != 1 ]
  then 
    echo "usage: mcd directory"
  else 
    if [ ! -d $1 ]
    then
      if [ -e $1 ]
      then
        echo "$1 exists but isn't a directory"
      else
        mkdir -p $1
        cd $1
      fi
    else
      cd $1
    fi
  fi
}

# splt stationname radius 
#
splt () {

  if [ $# != 1 ]
  then
    echo "splt StationName"
  else
    sessname=$1+`date +%Y%b%d:%Hhr`
    echo $sessname
    splat -t $1 -R 150 -L 5.0 -kml -ngs -o $sessname
    convert -transparent "#FFFFFF" $sessname.ppm $sessname.png
    convert -transparent "#FFFFFF" $sessname-ck.ppm $sessname-ck.png
    echo txsplt $sessname
  fi
}

# splt stationname radius 
#
splt-gis () {

  if [ $# != 1 ]
  then
    echo "splt StationName"
  else
    sessname=$1+`date +%Y%b%d:%Hhr`
    echo $sessname
    splat -t $1 -sc -R 150 -L 5.0 -kml -ngs -o $sessname
    convert -transparent "#FFFFFF" $sessname.ppm $sessname.png
    convert -transparent "#FFFFFF" $sessname-ck.ppm $sessname-ck.png
    echo txsplt $sessname
  fi
}


