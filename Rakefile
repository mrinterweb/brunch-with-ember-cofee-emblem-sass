require 'open-uri'
require 'pry'

namespace :update do
  
  desc "upgrade ember.js files takes optional argument of release, stable, canary"
  task :upgrade_ember, :version do |t, args|
    release = args[:version] || 'release'
    detect_version = ->(file) { File.readlines(file).detect { |l| l =~ /@version/ } }

    ember_path = './vendor/scripts/ember.js'

    if File.exists?(ember_path)
      puts "Existing ember version: #{detect_version.call(File.open(ember_path, 'r'))}"
    end

    %w[ember.js ember.min.js ember.prod.js].each do |file_name|
      uri = URI.parse("http://builds.emberjs.com/#{release}/#{file_name}")
      puts "Downloading: #{uri}"
      tmp_file = open(uri)
      if file_name == 'ember.js'
        puts "Downloaded version: #{detect_version.call(tmp_file)}"
      end
      puts "downloaded #{file_name} -> #{tmp_file.size / 1024}KB"
      File.rename tmp_file.to_path, "./vendor/scripts/#{file_name}"
    end
  end
end
