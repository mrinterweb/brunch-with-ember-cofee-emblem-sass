require 'open-uri'

namespace :update do
  
  desc "upgrade ember.js and ember-data.js files takes optional argument of release, stable, canary"
  task :upgrade_ember, :version do |t, args|
    release = args[:version] || 'release'
    detect_version = ->(file) { File.readlines(file).detect { |l| l =~ /@version/ } }

    ember_path = './vendor/scripts/ember.js'

    if File.exists?(ember_path)
      puts "Existing ember version: #{detect_version.call(File.open(ember_path, 'r'))}"
    end

    %w[ember.js ember.min.js ember.prod.js ember-data.js ember-data.prod.js ember-data.min.js].each do |file_name|
      url = "http://builds.emberjs.com/#{release}/#{file_name}"
      begin
        uri = URI.parse(url)
        puts "Downloading: #{uri}"
        tmp_file = open(uri)
      rescue OpenURI::HTTPError
        puts "Download failed: #{url}"
      end
      if tmp_file
        if file_name == 'ember.js'
          puts "Downloaded version: #{detect_version.call(tmp_file)}"
        end
        puts "downloaded #{file_name} -> #{tmp_file.size / 1024}KB"
        File.rename tmp_file.to_path, "./vendor/scripts/#{file_name}"
      end
    end
  end
end
