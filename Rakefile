
module FileSupport
  require 'json'
  require 'open-uri'

  def parse_name(path)
    path.match(%r~.*[/](?<name>.+)$~)[:name]
  end

  def grab_json(url)
    begin
      JSON.parse(download(url).read)
    rescue
      puts "There was a problem fetching y'r JSON"
    end
  end

  def download(url)
    begin
      puts "Downloading: #{url}"
      tmp_file = open(url)
      puts "downloaded #{tmp_file.size / 1024}KB"
      tmp_file
    rescue OpenURI::HTTPError
      puts "Download failed: #{url}"
    end
  end

  def download_and_move(url, destination)
    tmp_file = download(url)
    File.rename tmp_file, destination
  end

  def github_url_to_raw(url)
    url.sub("https://", "https://raw2.").sub('blob/', '')
  end

end

namespace :update do
  include FileSupport
  
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
      download_and_move(url, "./vendor/scripts/#{file_name}")
      if file_name == 'ember.js'
        ember_file = File.open("./vendor/scripts/#{file_name}", 'r')
        puts "Downloaded version: #{detect_version.call(ember_file)}"
      end
    end
  end

  desc "upgrade emblem"
  task :upgrade_emblem do
    emblem_url = "https://github.com/machty/emblem.js/raw/master/dist/emblem.js"
    # need to find the most recent version of handlebars being used.
    # will use the github api to check what the most recent version the tests are using
    # this is a pretty brittle way of determining the dependency
    contents = grab_json 'https://api.github.com/repos/machty/emblem.js/contents/test/resources'
    latest_handlebars_name = contents.map { |e| e['name'] }.select { |name| name =~ /^handlebars-/ }.last
    handlebars_url = contents.detect { |e| e['name'] == latest_handlebars_name }['_links']['html']
    handlebars_name = parse_name(handlebars_url)

    puts "Downloading emblem: #{handlebars_url}"
    download_and_move(github_url_to_raw(handlebars_url), "./vendor/scripts/#{handlebars_name}")

    # download emblem
    contents = grab_json 'https://api.github.com/repos/machty/emblem.js/contents/dist'
    contents.each do |entry|
      download_and_move(github_url_to_raw(entry['_links']['html']), "./vendor/scripts/#{entry['name']}")
    end
  end
end
